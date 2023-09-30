/**
 * convert a raw value to a string representation of the same value but
 * considering decimals
 *
 * @param value
 * @param decimals
 *
 * @example
 * getDecimalString('123', 2) === '1.23' // true
 */
export const getDecimalString = (value: string, decimals: number) => {
  if (!decimals) return value;

  if (value.length > decimals) {
    return `${value.slice(0, -1 * decimals)}.${value.slice(-1 * decimals)}`;
  }

  return `0.${'0'.repeat(decimals - value.length)}${value}`;
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
  )}${'0'.repeat(decimals - fractionalPartLength)}`.replace(/^0+(\d+)/, '$1');
};

/**
 * a utility to count decimal places in number in string type
 *
 * @param decimalString
 */
export const countDecimals = (decimalString: string | null) => {
  if (!decimalString) return 0;
  return decimalString.split('.')[1]?.length || 0;
};
