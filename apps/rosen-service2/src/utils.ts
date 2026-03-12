import JsonBigInt from '@rosen-bridge/json-bigint';

/**
 * map bigint value in data to string before inserting in redis
 *
 * @returns string
 */
export const stringSerializer = (data: unknown): string =>
  JsonBigInt.stringify(data, (_, value) =>
    typeof value === 'bigint' ? value.toString() : value,
  );
