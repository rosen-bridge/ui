type AsyncFunction = (...args: any[]) => Promise<any>;

type Wrap = <Func extends AsyncFunction>(
  func: Func,
) => (
  ...args: Parameters<Func>
) => Promise<Awaited<ReturnType<Func>> | WrapError>;

type Unwrap = <Func extends AsyncFunction>(
  func: Func,
) => (
  ...args: Parameters<Func>
) => Promise<Exclude<Awaited<ReturnType<Func>>, WrapError>>;

/**
 * Interface representing the result of an error.
 */
export interface WrapError {}

/**
 * Factory function to create wrap and unwrap functions.
 *
 * @param key - A string key used to identify errors.
 * @param errors - An array of error classes for handling.
 *
 * @returns An object containing the wrap and unwrap functions.
 *
 * @example
 * ```
 * // common.ts
 * const KEY = 'THIS_A_KEY';
 * class MyError extends Error {
 *   static [KEY] = 'my-error';
 * }
 * const { wrap, unwrap } = create(KEY, [MyError]);
 *
 * // server.ts
 * import { wrap } from './common.ts';
 * const greet = async (name: string) => {
 *   if (Math.random() > 0.5) throw new MyError('BOM');
 *   return 'Hello ' + name;
 * }
 * export const wrapped = wrap(greet);
 *
 * // client.ts
 * import { unwrap } from './common.ts';
 * import { wrapped } from './server.ts';
 * const unwrapped = unwrap(wrapped);
 * try {
 *   await unwrapped('John'); // Hello John
 * } catch (error) {
 *   if (error instanceof MyError) {
 *     // do
 *   }
 * }
 * ```
 */
export const create = (key: string, errors: Array<any>) => {
  /**
   * Convert the asynchronous function to a transferable type.
   *
   * @param func - The asynchronous function to convert.
   * @returns A new converted asynchronous function.
   */
  const wrap: Wrap =
    (func) =>
    async (...args) => {
      try {
        // Attempt to execute the asynchronous function with the provided arguments.
        return await func(...args);
      } catch (error: unknown) {
        // If an error is thrown, return a WrapError object.
        if (error instanceof Error) {
          return {
            message: error.message,
            [key]: (error.constructor as any)[key] || 'unknown',
          };
        }
        return {
          message: String(error),
          [key]: 'unknown',
        };
      }
    };

  /**
   * Recover the original asynchronous function.
   *
   * @param func - The converted asynchronous function.
   * @returns A new recovered asynchronous function.
   */
  const unwrap: Unwrap =
    (func) =>
    async (...args) => {
      // Execute the asynchronous function with the provided arguments.
      const result = await func(...args);

      // Return result if it not an object.
      if (Object.prototype.toString.call(result) != '[object Object]')
        return result;

      // Return result if the key is not in the object.
      if (!(key in result)) return result;

      // Try to reproduce the related error.
      for (const err of errors) {
        if (err[key] == result[key]) {
          throw new err(result.message);
        }
      }

      // Throw a generic error.
      throw new Error(result.message);
    };

  // Return an object containing the wrap and unwrap functions.
  return { wrap, unwrap };
};
