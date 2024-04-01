import { trimEnd } from 'lodash-es';

/**
 * convert a raw value to a string representation of the same value but
 * considering decimals (removing any leading redundant zeros) and optionally
 * truncating to a fixed number of decimal digits
 *
 * @param value
 * @param decimals
 * @param truncateLength
 *
 * @example
 * getDecimalString('123', 2) === '1.23' // true
 * getDecimalString('1230', 2) === '12.3' // true
 * getDecimalString('123456', 2, 3) === '12.345' // true
 */
export const getDecimalString = (
  value: string,
  decimals: number,
  truncateLength?: number
) => {
  if (!decimals) return value;

  const untrimmedResult =
    value.length > decimals
      ? `${value.slice(0, -decimals)}.${value.slice(-decimals)}`
      : `0.${value.padStart(decimals, '0')}`;

  const preciseResult = trimEnd(trimEnd(untrimmedResult, '0'), '.') || '0';

  return preciseResult.replace(
    /\.(.*)/,
    (_, floatingPart: string) => `.${floatingPart.slice(0, truncateLength)}`
  );
};

/**
 * convert a decimal-considered value to a string representation of the same
 * value but without decimals and also pruning any redundant zeros at the start
 *
 * @param value
 * @param decimals
 *
 * @example
 * getNonDecimalString('1.23', 2) === '123' // true
 */
export const getNonDecimalString = (value: string, decimals: number) => {
  if (!decimals) return value;

  const decimalPointIndex = value.indexOf('.');

  // if there is no fractional part, just add enough zeros at the end
  if (decimalPointIndex === -1) {
    return `${value}${'0'.repeat(decimals)}`;
  }

  // otherwise shift decimal point to the right and add enough zeros at the end
  const fractionalPartLength = value.length - decimalPointIndex - 1;

  return `${value.slice(0, decimalPointIndex)}${value.slice(
    decimalPointIndex + 1,
    decimalPointIndex + 1 + decimals
  )}${
    fractionalPartLength <= decimals
      ? '0'.repeat(decimals - fractionalPartLength)
      : ''
  }`.replace(/^0+(\d+)/, '$1');
};

/**
 * gets a number as input and rounds it to the precision according
 * to the provided precision number and removes the leading zeros.
 *
 * @param value
 * @param precision
 *
 * @example
 * roundToPrecision(1.126, 2) === 1.13 // true
 */
export const roundToPrecision = (value: number, precision: number) => {
  return Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision);
};

/**
 * Counts the number of decimal places in a given number.
 *
 * @param {number} inputNumber - The number to analyze.
 * @returns {number} The number of decimal places found, or 0 if there are none.
 */
export const getNumberOfDecimals = (inputNumber: number) => {
  return `${inputNumber}`.split('.')[1]?.length || 0;
};

/**
 * Validates that a number has the specified number of decimal places.
 * Throws an error if the number of decimal places exceeds the allowed limit.
 *
 * @param {number} inputNumber - The number to validate.
 * @param {number} allowedDecimals - The maximum number of decimal places allowed.
 * @throws {Error} If the number of decimal places in `inputNumber` exceeds `allowedDecimals`.
 */
export const validateDecimalPlaces = (
  inputNumber: number,
  allowedDecimals: number
) => {
  const currentDecimals = getNumberOfDecimals(inputNumber);

  if (currentDecimals > allowedDecimals) {
    throw new Error(
      `Invalid input: The value has ${currentDecimals} decimal places, but only ${allowedDecimals} are allowed. Please enter a value with ${allowedDecimals} decimal places.`
    );
  }
};
