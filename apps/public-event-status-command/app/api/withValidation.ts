// import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest } from 'next/server';

import { ValidationResult } from 'joi';

type ValidatorType<TSchema> = (
  request: NextRequest,
  params: unknown,
) => Promise<ValidationResult<TSchema>>;

type HandlerType<TSchema> = (value: TSchema) => Promise<any>;

export class AccessDeniedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AccessDeniedError';
  }
}

/**
 * a wrapper around handler returning a function which validates request,
 * converts request data during validation, and return general errors responses
 * (e.g. 400 when request is not valid or 500 when handler throws and error) if
 * needed
 * @param validator
 * @param handler
 */
export const withValidation =
  <TSchema>(validator: ValidatorType<TSchema>, handler: HandlerType<TSchema>) =>
  async (request: NextRequest, { params }: { params: Promise<unknown> }) => {
    const { error, value } = await validator(request, await params);

    if (error) {
      return Response.json(error.message, { status: 400 });
    }

    try {
      const response = await handler(value);
      return Response.json(response);
    } catch (error) {
      if (error instanceof ReferenceError) {
        return Response.json(error.message, { status: 404 });
      }
      if (error instanceof AccessDeniedError) {
        return Response.json(error.message, { status: 403 });
      }
      if (error instanceof Error) {
        return Response.json(error.message, { status: 500 });
      }
      return Response.json(JSON.stringify(error), { status: 500 });
    }
  };

export type ResponseData = any;
