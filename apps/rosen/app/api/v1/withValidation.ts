import { NextRequest } from 'next/server';

import { ValidationResult } from 'joi';

/**
 * a wrapper around handler returning a function which validates request,
 * converts request data during validation, and return general errors responses
 * (e.g. 400 when request is not valid or 500 when handler throws and error) if
 * needed
 * @param validator
 * @param handler
 */
export const withValidation =
  <TSchema>(
    validator: (
      request: NextRequest,
      context?: { params: any },
    ) => ValidationResult<TSchema>,
    handler: (value: TSchema) => Promise<any>,
  ) =>
  async (request: NextRequest, context?: { params: any }) => {
    const { error, value } = validator(request, context);

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
      if (error instanceof Error) {
        return Response.json(error.message, { status: 500 });
      }
      return Response.json(JSON.stringify(error), { status: 500 });
    }
  };
