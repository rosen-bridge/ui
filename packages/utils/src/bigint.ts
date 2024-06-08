/**
 * remove the decimal points from the input number and
 * convert number to bigInt
 * @param inputNumber
 */

export const convertNumberToBigint = (inputNumber: number) =>
  BigInt(Math.trunc(inputNumber));
