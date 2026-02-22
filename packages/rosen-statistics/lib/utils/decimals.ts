import { trimEnd } from 'lodash-es';

/**
 * Converts raw value to decimal string with specified precision
 *
 * @param value - Raw integer value
 * @param decimals - Number of decimal places
 * @returns Formatted decimal string
 */
export const getDecimalString = (
  value: bigint | number | string,
  decimals: number | undefined,
): string => {
  if (!decimals) return value.toString();

  const valueString = value.toString();
  const len = valueString.length;

  if (len > decimals) {
    const intPart = valueString.slice(0, -decimals);
    let fracPart = valueString.slice(-decimals);
    fracPart = trimEnd(fracPart, '0');
    return fracPart ? `${intPart}.${fracPart}` : intPart;
  }

  const padded = valueString.padStart(decimals, '0');
  const fracPart = trimEnd(padded, '0');
  return fracPart ? `0.${fracPart}` : '0';
};

/**
 * Converts decimal string to raw integer string
 *
 * @param value - Decimal value to convert
 * @param decimals - Number of decimal places
 * @returns Integer string without decimal point
 */
export const getNonDecimalString = (
  value: bigint | string | number,
  decimals: number,
): string => {
  if (!decimals || !value) return value?.toString() || '0';

  const valueString = value.toString();
  const decimalPointIndex = valueString.indexOf('.');

  if (decimalPointIndex === -1) {
    const result = valueString + '0'.repeat(decimals);
    return result.replace(/^0+/, '') || '0';
  }

  const intPart = valueString.slice(0, decimalPointIndex);
  const fracPart = valueString.slice(decimalPointIndex + 1);
  const fracLength = fracPart.length;

  let result: string;

  if (fracLength >= decimals) {
    result = intPart + fracPart.slice(0, decimals);
  } else {
    result = intPart + fracPart + '0'.repeat(decimals - fracLength);
  }

  return result.replace(/^0+/, '') || '0';
};
/**
 * Counts decimal places in a number
 *
 * @param inputNumber - Number to analyze
 * @returns Number of decimal places
 */
export const getNumberOfDecimals = (inputNumber: string | number): number => {
  if (!inputNumber) return 0;
  return `${inputNumber}`.split('.')[1]?.length || 0;
};

/**
 * Converts scientific notation to full decimal string
 *
 * @param value - Number in scientific or regular format
 * @returns Full decimal string representation
 *
 * @example
 * scientificToString(2e-15) === "0.000000000000002"
 * scientificToString(4e12) === "4000000000000"
 * scientificToString('1.23e5') === "123000"
 */
export const scientificToString = (value?: number | string): string => {
  if (!value) return '0';

  const str = value.toString();
  if (str.startsWith('0') && !str.includes('.')) {
    return '0';
  }

  if (!/e/i.test(str)) return str;

  const [base, exponent] = str.toLowerCase().split('e');
  const exp = Number(exponent);
  const isNegative = base.startsWith('-');
  const absBase = isNegative ? base.slice(1) : base;

  let [intPart, fracPart = ''] = absBase.split('.');
  const digits = intPart + fracPart;
  const decimalIndex = intPart.length;

  const newIndex = decimalIndex + exp;
  let result: string;

  if (newIndex <= 0) {
    result = `0.${'0'.repeat(-newIndex)}${digits}`.replace(/\.?0+$/, '');
  } else if (newIndex >= digits.length) {
    result = `${digits}${'0'.repeat(newIndex - digits.length)}`;
  } else {
    result = `${digits.slice(0, newIndex)}.${digits.slice(newIndex)}`.replace(
      /\.?0+$/,
      '',
    );
  }
  return isNegative ? `-${result}` : result;
};
