/* eslint-disable */
import { NextRequest, NextResponse } from 'next/server';

import { ValidationResult } from 'joi';

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
  <TSchema>(
    validator: (
      request: NextRequest,
      context?: { params: any },
    ) => Promise<ValidationResult<TSchema> | TSchema>,
    handler: (value: TSchema) => Promise<any>,
  ) =>
  async (request: NextRequest, context?: { params: any }) => {
    let value: TSchema;

    try {
      const result = await validator(request, context);

      if (
        result &&
        typeof result === 'object' &&
        ('error' in result || 'value' in result)
      ) {
        const { error, value: data } = result as ValidationResult<TSchema>;

        if (error) throw error;

        value = data;
      } else {
        value = result;
      }
    } catch (error) {
      return NextResponse.json((error as any).message, { status: 400 });
    }

    try {
      const response = await handler(value);
      return NextResponse.json(response);
    } catch (error) {
      if (error instanceof ReferenceError) {
        return NextResponse.json(error.message, { status: 404 });
      }
      if (error instanceof AccessDeniedError) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      if (error instanceof Error) {
        return NextResponse.json(error.message, { status: 500 });
      }
      return NextResponse.json(JSON.stringify(error), { status: 500 });
    }
  };
