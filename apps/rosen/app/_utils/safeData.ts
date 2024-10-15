type AsyncFunction = (...args: any[]) => Promise<any>;

type FromSafeData = <Func extends AsyncFunction>(
  func: Func,
) => (...args: Parameters<Func>) => Promise<Awaited<ReturnType<Func>>>;

type ToSafeData = <Func extends AsyncFunction>(
  func: Func,
) => (...args: Parameters<Func>) => Promise<Awaited<ReturnType<Func>>>;

const processDataType = (
  input: any,
  convertor: (value: any, type: string) => any,
): any => {
  const type = typeof input;

  if (type != 'object') return convertor(input, type);

  if (Array.isArray(input)) {
    return input.map((item: any) => processDataType(item, convertor));
  }

  if (input === null) {
    return convertor(input, 'null');
  }

  if (input instanceof Date) {
    return convertor(input, 'date');
  }

  const result = {} as any;

  for (const [key, value] of Object.entries(input)) {
    result[key] = processDataType(value, convertor);
  }

  return result;
};

const BIGINT_KEY = 'BIGINT:';

const from = <T>(input: T): T =>
  processDataType(input, (value, type) => {
    if (type != 'string' || !value.startsWith(BIGINT_KEY)) return value;
    return BigInt(value.replace(BIGINT_KEY, ''));
  });

const to = <T>(input: T): T =>
  processDataType(input, (value, type) => {
    if (type != 'bigint') return value;
    return BIGINT_KEY + value.toString();
  });

/**
 * Restore the original server action that was transformed by the 'toSafeData' wrapper.
 *
 * @example
 * ```
 * // client.ts
 * import { safeSum } from './server.ts';
 * const sum = fromSafeData(safeSum);
 * sum(1n, 2n);
 * ```
 */
export const fromSafeData: FromSafeData =
  (func) =>
  async (...args) =>
    from(await func(...to(args)));

/**
 * Transform an asynchronous function into a new one that accepts safe-type arguments
 * and converting the original function's output into a safe-type.
 *
 * @example
 * ```
 * // server.ts
 * const sum = async (a: bigint, b: bigint) => a + b;
 * export const safeSum = toSafeData(sum);
 * ```
 */
export const toSafeData: ToSafeData =
  (func) =>
  async (...args) =>
    to(await func(...from(args)));
