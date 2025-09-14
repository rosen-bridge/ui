export const format = (input: string, decimals: number): string => {
  const stringValue = input.trim();

  if (!stringValue) return '0';

  const powerOfTen = (num: number) => 10n ** BigInt(num);

  const normalizeNumber = (str: string) => {
    const match = str.match(/^(\d*)(?:\.(\d*))?(?:[eE]([+-]?\d+))?$/);

    if (!match)
      return {
        integer: '0',
        fraction: '',
      };

    let [, integer = '0', fraction = '', exponent] = match;

    const digits = (integer + fraction).replace(/^0+/, '') || '0';

    const position = integer.length + (exponent ? parseInt(exponent, 10) : 0);

    if (!match[3])
      return {
        integer: integer.replace(/^0+/, '') || '0',
        fraction,
      };

    if (position <= 0)
      return {
        integer: '0',
        fraction: '0'.repeat(-position) + digits,
      };

    if (position >= digits.length)
      return {
        integer: digits + '0'.repeat(position - digits.length),
        fraction: '',
      };

    return {
      integer: digits.slice(0, position) || '0',
      fraction: digits.slice(position),
    };
  };

  const roundNumber = (
    integer: string,
    fraction: string,
    decimalPlaces: number,
  ) => {
    const paddedFraction = (fraction || '').padEnd(decimalPlaces + 1, '0');

    let mainDigits = BigInt(
      integer + paddedFraction.slice(0, decimalPlaces) || '0',
    );

    if (paddedFraction[decimalPlaces] >= '5') mainDigits++;

    const integerValue = mainDigits / powerOfTen(decimalPlaces);

    const fractionValue = mainDigits % powerOfTen(decimalPlaces);

    const fractionString = decimalPlaces
      ? fractionValue.toString().padStart(decimalPlaces, '0').replace(/0+$/, '')
      : '';

    return (
      integerValue.toString() + (fractionString ? '.' + fractionString : '')
    );
  };

  const { integer, fraction } = normalizeNumber(stringValue);

  if (integer === '0' && (!fraction || /^0*$/.test(fraction))) return '0';

  if (integer !== '0') {
    const fractionDigits = fraction || '';

    const leftSide = (fractionDigits ? BigInt(fractionDigits) : 0n) * 1000n;

    const rightSide = BigInt(integer) * powerOfTen(fractionDigits.length);

    return leftSide < rightSide
      ? integer
      : roundNumber(integer, fraction, decimals);
  }

  const firstNonZeroIndex = (fraction || '').search(/[1-9]/);

  const decimalPlaces = Math.max(decimals, firstNonZeroIndex + 1);

  return roundNumber('0', fraction, decimalPlaces);
};
