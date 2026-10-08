import { STATUS_CODES } from 'node:http';

import type { NextRequest } from 'next/server';

import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';

import { env } from '@/env';
import { AccessDeniedError, BadRequestError, NotFoundError } from '@/errors';

type Schema = { params?: Validator; query?: Validator; body?: Validator };

/**
 * a zod schema, or a function which parses the request source itself; any
 * error thrown by the function is reported as a validation issue
 */
type Validator = z.ZodType | ((args: { request: NextRequest; context: Context }) => unknown);

/**
 * typed by the params schema, so that Next.js reports a type error when the
 * schema does not match the dynamic segments of the route
 */
type Context<TSchema extends Schema = Schema> = {
  params: Promise<TSchema['params'] extends z.ZodType ? z.input<TSchema['params']> : unknown>;
};

type Output<TValidator> = TValidator extends z.ZodType
  ? z.output<TValidator>
  : TValidator extends (...args: never[]) => infer R
    ? Awaited<R>
    : undefined;

type Input<TSchema extends Schema> = { [K in keyof TSchema]: Output<TSchema[K]> };

/**
 * validate the data of a request source, throwing a `BadRequestError` with a
 * readable description of the issues when it is not valid
 * @param validator
 * @param data
 * @param args passed to the validator when it is a function
 */
const validate = async (
  validator: Validator,
  data: unknown,
  args: { request: NextRequest; context: Context },
) => {
  if (typeof validator === 'function') {
    try {
      return await validator(args);
    } catch (error) {
      throw new BadRequestError((error as Error).message);
    }
  }

  const result = await validator.safeParseAsync(data);

  if (!result.success) {
    throw new BadRequestError(z.prettifyError(result.error));
  }

  return result.data;
};

/**
 * create an RFC 9457 problem details response
 * @param request
 * @param status
 * @param detail
 */
const toProblem = (request: NextRequest, status: number, detail: string) =>
  Response.json(
    {
      type: 'about:blank',
      title: STATUS_CODES[status],
      status,
      detail,
      instance: request.nextUrl.pathname,
    },
    {
      status,
      headers: {
        'Content-Type': 'application/problem+json',
      },
    },
  );

/**
 * define a route handler which validates params, query and body of the
 * request separately, passes them to the handler as `input`, and converts the
 * result or the thrown error to a response
 * @param config
 */
export const defineRoute =
  <TSchema extends Schema = Schema>(config: {
    /**
     * CDN cache duration of successful GET responses in seconds, defaults to
     * `API_CACHE_SECONDS`; `false` disables it
     */
    cache?: number | false;
    schema?: TSchema;
    handler: (args: {
      request: NextRequest;
      context: Context<TSchema>;
      input: Input<TSchema>;
    }) => unknown;
  }) =>
  async (request: NextRequest, context: Context<TSchema>): Promise<Response> => {
    const input: Record<string, unknown> = {};

    try {
      const args = { request, context };

      if (config.schema?.params) {
        const schema = config.schema.params;

        const data = await context.params;

        input.params = await validate(schema, data, args);
      }

      if (config.schema?.query) {
        const schema = config.schema.query;

        const data = Object.fromEntries(request.nextUrl.searchParams);

        input.query = await validate(schema, data, args);
      }

      if (config.schema?.body) {
        const schema = config.schema.body;

        const data = await request
          .clone()
          .json()
          .catch((cause) => {
            throw new BadRequestError('Malformed JSON body', { cause });
          });

        input.body = await validate(schema, data, args);
      }

      const result = await config.handler({
        request,
        context,
        input: input as Input<TSchema>,
      });

      if (result instanceof Response) return result;

      if (result === undefined) return new Response(null, { status: 204 });

      const cache = config.cache ?? env.API_CACHE_SECONDS;
      const headers =
        cache && request.method === 'GET'
          ? { 'Cache-Control': `public, max-age=0, s-maxage=${cache}` }
          : undefined;

      return Response.json(result, { headers });
    } catch (error) {
      const status = (() => {
        if (error instanceof BadRequestError) return 400;
        if (error instanceof AccessDeniedError) return 403;
        if (error instanceof NotFoundError) return 404;
      })();

      if (status) return toProblem(request, status, (error as Error).message);

      Sentry.withScope((scope) => {
        scope.setTag('layer', 'api-route');
        scope.setContext('request', { url: request.url, method: request.method });
        scope.setContext('validation', { value: input });
        Sentry.captureException(error);
      });

      return toProblem(request, 500, 'Internal server error');
    }
  };
