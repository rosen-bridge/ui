import { NextRequest } from 'next/server';

import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';

import { defineRoute } from '@/app/api/defineRoute';
import { AccessDeniedError, BadRequestError, NotFoundError } from '@/errors';

vi.mock('@/env', () => ({ env: { API_CACHE_SECONDS: 60 } }));

vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  withScope: vi.fn((callback) => callback({ setTag: vi.fn(), setContext: vi.fn() })),
}));

const ID = 'a'.repeat(64);

const params = z.object({ id: z.hex().length(64) }).strict();
const query = z.object({ limit: z.coerce.number().int().min(1).max(100).default(10) });
const body = z.object({ text: z.string().min(1) }).strict();

const url = (path = '') => `http://localhost/api/v1/events/${ID}${path}`;
const context = (id = ID) => ({ params: Promise.resolve({ id }) });

describe('defineRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validation', () => {
    /**
     * @target defineRoute should pass the validated params and query to the
     * handler
     * @dependencies
     * @scenario
     * - call a GET route with a valid id, a limit and an extra `id` query param
     * @expected
     * - the handler should receive the validated and converted values
     * - the `id` query param should not override the `id` route param
     */
    it('should pass the validated params and query to the handler', async () => {
      // arrange
      const GET = defineRoute({
        schema: { params, query },
        handler: ({ input }) => {
          expectTypeOf(input).toEqualTypeOf<{
            params: { id: string };
            query: { limit: number };
          }>();
          return input;
        },
      });

      // act
      const response = await GET(new NextRequest(url('?limit=5&id=other')), context());

      // assert
      expect(response.status).toEqual(200);
      expect(await response.json()).toEqual({ params: { id: ID }, query: { limit: 5 } });
    });

    /**
     * @target defineRoute should pass the validated body to the handler while
     * keeping the original body readable
     * @dependencies
     * @scenario
     * - call a POST route with a valid json body
     * @expected
     * - the handler should receive the validated body
     * - the handler should be able to read the original body
     */
    it('should pass the validated body to the handler while keeping the original body readable', async () => {
      // arrange
      const POST = defineRoute({
        schema: { body },
        handler: async ({ request, input }) => ({
          text: input.body.text,
          raw: await request.text(),
        }),
      });

      // act
      const response = await POST(
        new NextRequest(url(), { method: 'POST', body: '{"text":"hi"}' }),
        context(),
      );

      // assert
      expect(await response.json()).toEqual({ text: 'hi', raw: '{"text":"hi"}' });
    });

    /**
     * @target defineRoute should pass the result of a parser function to the
     * handler
     * @dependencies
     * @scenario
     * - call a route whose query is parsed by a function reading the request
     * @expected
     * - the handler should receive the parser result, typed as its return type
     */
    it('should pass the result of a parser function to the handler', async () => {
      // arrange
      const GET = defineRoute({
        schema: {
          query: ({ request }) => ({ page: Number(request.nextUrl.searchParams.get('page')) }),
        },
        handler: ({ input }) => {
          expectTypeOf(input).toEqualTypeOf<{ query: { page: number } }>();
          return input.query;
        },
      });

      // act
      const response = await GET(new NextRequest(url('?page=2')), context());

      // assert
      expect(await response.json()).toEqual({ page: 2 });
    });

    /**
     * @target defineRoute should only provide the sources which have a schema
     * @dependencies
     * @scenario
     * - define a route with only a params schema
     * @expected
     * - accessing the body should be a type error
     */
    it('should only provide the sources which have a schema', () => {
      defineRoute({
        schema: { params },
        // @ts-expect-error body is not part of the input when no body schema is given
        handler: ({ input }) => input.body,
      });
    });

    /**
     * @target defineRoute should return a 400 problem details response with a
     * readable description of the issues when request is not valid
     * @dependencies
     * @scenario
     * - call a GET route with an invalid id
     * @expected
     * - response status should be 400
     * - response content type should be application/problem+json
     * - response body should be a problem details object describing the issue
     *   and its location
     * - handler should not be called
     */
    it('should return a 400 problem details response with a readable description of the issues when request is not valid', async () => {
      // arrange
      const handler = vi.fn();
      const GET = defineRoute({ schema: { params }, handler });

      // act
      const response = await GET(new NextRequest(url()), context('nope'));
      const problem = await response.json();

      // assert
      expect(response.status).toEqual(400);
      expect(response.headers.get('Content-Type')).toEqual('application/problem+json');
      expect(problem).toEqual({
        type: 'about:blank',
        title: 'Bad Request',
        status: 400,
        detail: expect.stringContaining('→ at id'),
        instance: `/api/v1/events/${ID}`,
      });
      expect(handler).not.toHaveBeenCalled();
    });

    /**
     * @target defineRoute should stop validation at the first invalid source
     * @dependencies
     * @scenario
     * - call a GET route with an invalid id and an out of range limit
     * @expected
     * - response status should be 400
     * - response detail should only describe the params issues
     */
    it('should stop validation at the first invalid source', async () => {
      // arrange
      const GET = defineRoute({ schema: { params, query }, handler: vi.fn() });

      // act
      const response = await GET(new NextRequest(url('?limit=500')), context('nope'));
      const { detail } = await response.json();

      // assert
      expect(response.status).toEqual(400);
      expect(detail).toContain('→ at id');
      expect(detail).not.toContain('limit');
    });

    /**
     * @target defineRoute should return 400 for any error thrown by a parser
     * function
     * @dependencies
     * @scenario
     * - call a route whose query parser throws a plain Error
     * - call a route whose query parser throws an AccessDeniedError
     * @expected
     * - both responses should be 400 with the error message as the detail
     * - handlers should not be called
     */
    it('should return 400 for any error thrown by a parser function', async () => {
      // arrange
      const handler = vi.fn();
      const invalid = defineRoute({
        schema: {
          query: () => {
            throw new Error('Limit cannot be greater than 100');
          },
        },
        handler,
      });
      const denied = defineRoute({
        schema: {
          query: () => {
            throw new AccessDeniedError('access denied');
          },
        },
        handler,
      });

      // act
      const invalidResponse = await invalid(new NextRequest(url()), context());
      const deniedResponse = await denied(new NextRequest(url()), context());

      // assert
      expect(invalidResponse.status).toEqual(400);
      expect((await invalidResponse.json()).detail).toEqual('Limit cannot be greater than 100');
      expect(deniedResponse.status).toEqual(400);
      expect((await deniedResponse.json()).detail).toEqual('access denied');
      expect(handler).not.toHaveBeenCalled();
    });

    /**
     * @target defineRoute should return 400 when request body is malformed
     * @dependencies
     * @scenario
     * - call a POST route with a malformed json body
     * @expected
     * - response status should be 400
     * - response detail should explain that the body is malformed
     */
    it('should return 400 when request body is malformed', async () => {
      // arrange
      const POST = defineRoute({ schema: { body }, handler: vi.fn() });

      // act
      const response = await POST(new NextRequest(url(), { method: 'POST', body: '{' }), context());

      // assert
      expect(response.status).toEqual(400);
      expect((await response.json()).detail).toEqual('Malformed JSON body');
    });
  });

  describe('response', () => {
    /**
     * @target defineRoute should add the default cache header to successful GET
     * responses
     * @dependencies
     * - API_CACHE_SECONDS
     * @scenario
     * - call a GET route and a POST route without a cache option
     * @expected
     * - the GET response should have a Cache-Control header from
     *   `API_CACHE_SECONDS`
     * - the POST response should not have a Cache-Control header
     */
    it('should add the default cache header to successful GET responses', async () => {
      // arrange
      const route = defineRoute({ handler: () => ({}) });

      // act
      const getResponse = await route(new NextRequest(url()), context());
      const postResponse = await route(new NextRequest(url(), { method: 'POST' }), context());

      // assert
      expect(getResponse.headers.get('Cache-Control')).toEqual('public, max-age=0, s-maxage=60');
      expect(postResponse.headers.get('Cache-Control')).toBeNull();
    });

    /**
     * @target defineRoute should use the cache option of the route
     * @dependencies
     * @scenario
     * - call a GET route with `cache: 30` and another one with `cache: false`
     * @expected
     * - the first response should have a 30 seconds Cache-Control header
     * - the second response should not have a Cache-Control header
     */
    it('should use the cache option of the route', async () => {
      // arrange
      const cached = defineRoute({ cache: 30, handler: () => ({}) });
      const uncached = defineRoute({ cache: false, handler: () => ({}) });

      // act
      const cachedResponse = await cached(new NextRequest(url()), context());
      const uncachedResponse = await uncached(new NextRequest(url()), context());

      // assert
      expect(cachedResponse.headers.get('Cache-Control')).toEqual('public, max-age=0, s-maxage=30');
      expect(uncachedResponse.headers.get('Cache-Control')).toBeNull();
    });

    /**
     * @target defineRoute should return 204 when handler returns nothing and the
     * response as is when handler returns a `Response`
     * @dependencies
     * @scenario
     * - call a route whose handler returns nothing
     * - call a route whose handler returns a 201 response
     * @expected
     * - responses status should be 204 and 201 respectively
     */
    it('should return 204 when handler returns nothing and the response as is when handler returns a Response', async () => {
      // arrange
      const empty = defineRoute({ handler: () => undefined });
      const created = defineRoute({ handler: () => Response.json({}, { status: 201 }) });

      // act
      const emptyResponse = await empty(new NextRequest(url(), { method: 'DELETE' }), context());
      const createdResponse = await created(new NextRequest(url(), { method: 'POST' }), context());

      // assert
      expect(emptyResponse.status).toEqual(204);
      expect(createdResponse.status).toEqual(201);
    });
  });

  describe('errors', () => {
    /**
     * @target defineRoute should return the status of the known errors thrown by
     * handler
     * @dependencies
     * - Sentry
     * @scenario
     * - call routes whose handlers throw BadRequestError, AccessDeniedError and
     *   NotFoundError
     * @expected
     * - responses status should be 400, 403 and 404 respectively
     * - the error message should be returned as the detail
     * - errors should not be reported to Sentry
     */
    it('should return the status of the known errors thrown by handler', async () => {
      // arrange
      const routes = [
        new BadRequestError('bad request'),
        new AccessDeniedError('access denied'),
        new NotFoundError('not found'),
      ].map((error) =>
        defineRoute({
          handler: () => {
            throw error;
          },
        }),
      );

      // act
      const responses = await Promise.all(
        routes.map((route) => route(new NextRequest(url()), context())),
      );
      const problems = await Promise.all(responses.map((response) => response.json()));

      // assert
      expect(responses.map((response) => response.status)).toEqual([400, 403, 404]);
      expect(problems.map((problem) => problem.detail)).toEqual([
        'bad request',
        'access denied',
        'not found',
      ]);
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });

    /**
     * @target defineRoute should return 500 and report to Sentry when handler
     * throws an unexpected error
     * @dependencies
     * - Sentry
     * @scenario
     * - call a route whose handler throws a ReferenceError (a programming bug)
     * @expected
     * - response status should be 500
     * - response body should not leak the error message
     * - error should be reported to Sentry
     */
    it('should return 500 and report to Sentry when handler throws an unexpected error', async () => {
      // arrange
      const error = new ReferenceError('foo is not defined');
      const GET = defineRoute({
        handler: () => {
          throw error;
        },
      });

      // act
      const response = await GET(new NextRequest(url()), context());

      // assert
      expect(response.status).toEqual(500);
      expect((await response.json()).detail).toEqual('Internal server error');
      expect(Sentry.captureException).toHaveBeenCalledWith(error);
    });

    /**
     * @target defineRoute should return 500 and report to Sentry when a zod
     * schema throws an unexpected error
     * @dependencies
     * - Sentry
     * @scenario
     * - call a route whose query schema has a transform throwing an error (a
     *   programming bug)
     * @expected
     * - response status should be 500
     * - error should be reported to Sentry
     */
    it('should return 500 and report to Sentry when a zod schema throws an unexpected error', async () => {
      // arrange
      const error = new Error('unexpected');
      const GET = defineRoute({
        schema: {
          query: z.object({}).transform(() => {
            throw error;
          }),
        },
        handler: vi.fn(),
      });

      // act
      const response = await GET(new NextRequest(url()), context());

      // assert
      expect(response.status).toEqual(500);
      expect(Sentry.captureException).toHaveBeenCalledWith(error);
    });
  });
});
