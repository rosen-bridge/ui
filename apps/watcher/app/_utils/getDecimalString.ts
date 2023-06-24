/**
 * converts a raw value to a string representation of the same value but
 * considering decimals
 * @param value
 * @param decimals
 */
const getDecimalString = (value: string, decimals: number) => {
  if (!decimals) return value;

  if (value.length > decimals) {
    return `${value.slice(0, -1 * decimals)}.${value.slice(-1 * decimals)}`;
  }

  return `0.${'0'.repeat(decimals - value.length)}${value}`;
};

export default getDecimalString;
