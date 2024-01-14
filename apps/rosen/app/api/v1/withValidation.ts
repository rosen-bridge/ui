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
const withValidation =
  <TSchema>(
    validator: (request: NextRequest) => ValidationResult<TSchema>,
    handler: (value: TSchema) => Promise<any>,
  ) =>
  async (request: NextRequest) => {
    const { error, value } = validator(request);

    if (error) {
      return Response.json(error.message, { status: 400 });
    }

    try {
      const response = await handler(value);
      return Response.json(response);
    } catch (error) {
      return Response.json(error, { status: 500 });
    }
  };

export default withValidation;
