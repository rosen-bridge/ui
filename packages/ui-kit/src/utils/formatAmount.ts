import { getDecimalString } from '@rosen-ui/utils';

export type FormatAmountValue = bigint | number | string;

export type FormatAmountOptions = {
  decimalMaxFractionDigits?: number;
  decimalLeadingZeroThreshold?: number;
};

export const formatAmount = (
  value?: FormatAmountValue,
  decimal?: number,
  options?: FormatAmountOptions,
) => {
  const normalized = normalizeValue(value);

  if (!normalized) return;

  const withDecimal = applyDecimal(normalized, decimal);

  const tooltip = formatTooltip(withDecimal);

  const parts = computeParts(
    withDecimal,
    options?.decimalMaxFractionDigits,
    options?.decimalLeadingZeroThreshold,
  );

  return {
    ...parts,
    tooltip,
  };
};

const applyDecimal = (value: string, decimal?: number): string => {
  if (decimal === undefined) return value;

  if (value.includes('.')) {
    throw new Error('');
  }

  return getDecimalString(value, decimal);
};

const computeParts = (
  value: string,
  decimalMaxFractionDigits?: number,
  decimalLeadingZeroThreshold?: number,
) => {
  const [splittedValueNumber, splittedValueDecimal] = value.split('.');

  const decimalLength = splittedValueDecimal?.length || 0;

  if (BigInt(splittedValueNumber) > 0n) {
    const units = [undefined, 'K', 'M', 'B', 'T'];

    const num = splittedValueNumber + (splittedValueDecimal || '');

    const str = BigInt(num).toString().replace(/^0+/, '') || '0';

    const index = Math.min(
      Math.floor((str.length - 1 - decimalLength) / 3),
      units.length - 1,
    );

    const value = Number(num) / 10 ** decimalLength / 1000 ** index;
    const val = value.toFixed(decimalMaxFractionDigits).replace(/0+$/, '');

    return {
      fraction: val.split('.')[1] || '0',
      number: val.split('.')[0],
      unit: units[index],
      zeros: undefined,
    };
  }

  const leadingZeros = splittedValueDecimal?.match(/^(0*)/)?.[1]?.length || 0;

  const threshold =
    decimalLeadingZeroThreshold !== undefined &&
    leadingZeros >= decimalLeadingZeroThreshold
      ? leadingZeros
      : undefined;

  const precision =
    decimalMaxFractionDigits === undefined
      ? splittedValueDecimal.length
      : leadingZeros + decimalMaxFractionDigits - (threshold ? 1 : 0);

  let fraction = Number(`0.${splittedValueDecimal || 0}`)
    .toFixed(precision)
    .replace(/^0\./, '')
    .replace(/0+$/, '');

  if (threshold) {
    fraction = fraction.replace('0'.repeat(threshold), '');
  }

  return {
    fraction,
    number: '0',
    unit: undefined,
    zeros: threshold,
  };
};

const formatTooltip = (value: string) => {
  return value.replace(/^\d+/, (m) => m.replace(/\B(?=(\d{3})+(?!\d))/g, ','));
};

/**
 * try to convert value to a valid string number with decimal if is available
 *
 * examples
 *   - undefined     -> undefined
 *   - ''           -> error
 *   - ' '          -> error
 *   - 'hi'         -> error
 *   - '1234h'      -> error
 *   - '1234.56k78' -> error
 *   - NaN          -> error
 *   - 12345        -> '12345'
 *   - '12345'      -> '12345'
 *   - '12345.6789' -> '12345.6789'
 *   - 12345.6789   -> '12345.6789'
 *   - '3e-12'      -> '0.000000000003'
 *   - 12345n       -> '12345'
 */
const normalizeValue = (value?: FormatAmountValue): string | undefined => {
  switch (typeof value) {
    case 'bigint':
      return value.toString();
    case 'number':
      if (isNaN(value)) {
        throw new Error('');
      }
      return value
        .toLocaleString('en', {
          useGrouping: false,
          minimumFractionDigits: 1,
          maximumFractionDigits: 20,
        })
        .replace(/\.0$/, '');
    case 'string':
      if (isNaN(Number(value))) {
        throw new Error('');
      }
      return Number(value)
        .toLocaleString('en', {
          useGrouping: false,
          minimumFractionDigits: 1,
          maximumFractionDigits: 20,
        })
        .replace(/\.0$/, '');
    case 'undefined':
      return;
    default:
      throw new Error('');
  }
};
