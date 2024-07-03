type AsyncFunction = (...args: any[]) => Promise<any>;

type Wrap = <Func extends AsyncFunction>(
  func: Func,
) => (
  ...args: Parameters<Func>
) => Promise<Awaited<ReturnType<Func>> | WrapResult>;

type Unwrap = <Func extends AsyncFunction>(
  func: Func,
) => (
  ...args: Parameters<Func>
) => Promise<Exclude<Awaited<ReturnType<Func>>, WrapResult>>;

export class WrapResult {}

export const create = (key: string, errors: Array<any>) => {
  const wrap: Wrap =
    (func) =>
    async (...args) => {
      try {
        return await func(...args);
      } catch (error: any) {
        return {
          message: error.message,
          [key]: error.constructor[key] || 'unknown',
        };
      }
    };

  const unwrap: Unwrap =
    (func) =>
    async (...args) => {
      const result = await func(...args);

      if (Object.prototype.toString.call(result) != '[object Object]')
        return result;

      if (!(key in result)) return result;

      for (const err of errors) {
        if (err[key] == result[key]) {
          throw new err(result.message);
        }
      }

      throw new Error(result.message);
    };

  return { wrap, unwrap };
};
