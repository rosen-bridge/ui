import {
  SEGWIT_INPUT_WEIGHT_UNIT,
  SEGWIT_OUTPUT_WEIGHT_UNIT,
} from './constants';

/**
 * gets the minimum amount of satoshi for a utxo that can cover
 * additional fee for adding it to a tx
 * @returns the minimum amount
 */
export const getMinimumMeaningfulSatoshi = (feeRatio: number): bigint => {
  return BigInt(
    Math.ceil(
      (feeRatio * SEGWIT_INPUT_WEIGHT_UNIT) / 4 // estimate fee per weight and convert to virtual size
    )
  );
};

/**
 * estimates tx weight based on number of inputs and outputs
 * inputs and outputs required fee are estimated by segwit weight unit
 * @param inputSize
 * @param outputSize
 * @param feeRatio
 */
export const estimateTxWeight = (
  inputSize: number,
  outputSize: number,
  opReturnLength: number
): number => {
  const x =
    40 +
    2 + // all txs include 40W. P2WPKH txs need additional 2W
    44 + // OP_RETURN output base weight
    opReturnLength * 2 + // OP_RETURN output data counts as vSize, so weight = hexString length / 2 * 4
    inputSize * SEGWIT_INPUT_WEIGHT_UNIT + // inputs weights
    outputSize * SEGWIT_OUTPUT_WEIGHT_UNIT; // outputs weights
  return x;
};

/**
 * remove the decimal points from the input number and
 * convert number to bigInt
 * @param inputNumber
 */

export const convertNumberToBigint = (inputNumber: number) =>
  BigInt(Math.trunc(inputNumber));
