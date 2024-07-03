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

export const PROPERTY_NAME = '__TYPE__';

export class WrapError extends Error {
  static [PROPERTY_NAME] = 'default';
}

export const create = (...errors: Array<typeof WrapError>) => {
  const wrap: Wrap =
    (func) =>
    async (...args) => {
      try {
        return await func(...args);
      } catch (error: any) {
        return {
          message: error.message,
          [PROPERTY_NAME]: error.constructor[PROPERTY_NAME],
        };
      }
    };

  const unwrap: Unwrap =
    (func) =>
    async (...args) => {
      const result = await func(...args);

      if (Object.prototype.toString.call(result) != '[object Object]')
        return result;

      for (const err of errors) {
        if (err[PROPERTY_NAME] != result[PROPERTY_NAME]) continue;

        const error = new err(result.message);

        for (const key in result) {
          if (!Object.prototype.hasOwnProperty.call(result, key)) continue;
          (error as any)[key] = result[key];
        }

        throw error;
      }

      return result;
    };

  return { wrap, unwrap };
};
