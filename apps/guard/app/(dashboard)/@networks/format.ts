const UNITS = [
  { value: 1e9, symbol: 'B' },
  { value: 1e6, symbol: 'M' },
  { value: 1e3, symbol: 'K' },
];

const formatDigits = (num: number): string => {
  const intDigits = Math.floor(num).toString().length;
  const decimals = Math.max(0, 4 - intDigits);
  return num.toFixed(decimals);
};

const formatMoreThanOne = (num: number): string => {
  for (let i = 0; i < UNITS.length; i++) {
    if (num >= UNITS[i].value) {
      return formatDigits(num / UNITS[i].value) + ' ' + UNITS[i].symbol;
    }
  }
  return formatDigits(num);
};

const formatLessThanOne = (num: number): string => {
  if (num >= 0.001) return num.toFixed(3);

  if (num >= 0.0005) return '0.001';

  const [, exponentialString] = num.toExponential(20).split('e');

  const exponential = parseInt(exponentialString, 10);

  const exponentialABS = Math.abs(exponential);

  const zerosBeforeFirst = exponentialABS - 1;

  const parentheseZeros = Math.max(0, zerosBeforeFirst - 1);

  const M = num * Math.pow(10, exponentialABS);

  const scale = Math.pow(10, 4 - 1);

  const integer = Math.floor(M * scale + 1e-12);

  let digits = String(integer).replace(/0+$/, '');

  if (digits === '') digits = '0';

  const parenthese =
    '0'.repeat(parentheseZeros) || `(${'0'.repeat(parentheseZeros)})`;

  return `0.0${parenthese}${digits}`;
};

export const format = (input: string): string => {
  const num = parseFloat(input);

  if (num === 0) return '0.000';

  if (num < 1) return formatLessThanOne(num);

  return formatMoreThanOne(num);
};
