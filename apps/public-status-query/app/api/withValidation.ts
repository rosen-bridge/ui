import { NextRequest } from 'next/server';

import { ValidationResult } from 'joi';

type ValidatorType<TSchema, TParams> = (
  request: NextRequest,
  params: TParams,
) => Promise<ValidationResult<TSchema>>;

type HandlerType<TSchema> = (value: TSchema) => Promise<any>;

/**
 * a wrapper around handler returning a function which validates request,
 * converts request data during validation, and return general errors responses
 * (e.g. 400 when request is not valid or 500 when handler throws and error) if
 * needed
 * @param validator
 * @param handler
 */
export const withValidation =
  <TSchema, TParams>(
    validator: ValidatorType<TSchema, TParams>,
    handler: HandlerType<TSchema>,
  ) =>
  async (request: NextRequest, { params }: { params: Promise<TParams> }) => {
    const { error, value } = await validator(request, await params);

    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    try {
      const response = await handler(value);
      return Response.json(response);
    } catch (error) {
      if (error instanceof ReferenceError) {
        return Response.json({ error: error.message }, { status: 404 });
      }
      if (error instanceof Error) {
        console.error(error.message);
        return Response.json({ error: error.message }, { status: 500 });
      }
      console.error(JSON.stringify(error));
      return Response.json(JSON.stringify(error), { status: 500 });
    }
  };
