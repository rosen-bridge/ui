import Joi from 'joi';

import { ValidationError } from '@/_errors';

type AsyncFunction<Args extends any[], Return> = (
  ...args: Args
) => Promise<Return>;

type WithValidation = <Args extends any[], Return>(
  schema: Joi.Schema<Args>,
  handler: AsyncFunction<Args, Return>,
) => AsyncFunction<Args, Return>;

/**
 * Validates the arguments of an asynchronous function before executing it.
 *
 * @param schema - The Joi schema to validate the handler's arguments against.
 * @param handler - The asynchronous function whose arguments need validation.
 * @returns The original handler.
 */
export const withValidation: WithValidation =
  (schema, handler) =>
  (...args) => {
    const { error } = schema.validate(args);

    if (error) {
      throw new ValidationError(error.message);
    }

    return handler(...args);
  };
