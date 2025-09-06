import { encodeAddress } from '@rosen-bridge/address-codec';
import {
  BitcoinRunesUtxo,
  FeeEstimator,
} from '@rosen-bridge/bitcoin-runes-utxo-selection';
import JsonBigInt from '@rosen-bridge/json-bigint';
import {
  calculateFeeCreator,
  getMinTransferCreator as getMinTransferCreatorBase,
} from '@rosen-network/base';
import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';
import Axios from 'axios';
import { Psbt } from 'bitcoinjs-lib';

import {
  CONFIRMATION_TARGET,
  SEGWIT_OUTPUT_WEIGHT_UNIT,
  TAPROOT_INPUT_WEIGHT_UNIT,
  TAPROOT_OUTPUT_WEIGHT_UNIT,
} from './constants';
import type {
  UnisatAddressBtcUtxos,
  UnisatAddressRunesUtxos,
  UnisatResponse,
} from './types';

/**
 * generates metadata for lock transaction
 * @param toChain
 * @param toAddress
 * @param networkFee
 * @param bridgeFee
 * @returns
 */
export const generateOpReturnData = async (
  toChain: Network,
  toAddress: string,
  networkFee: string,
  bridgeFee: string,
): Promise<string> => {
  // parse toChain
  const toChainCode = (NETWORKS[toChain]?.index ?? -1) as number;
  if (toChainCode === -1) throw Error(`invalid toChain [${toChain}]`);
  const toChainHex = toChainCode.toString(16).padStart(2, '0');

  // parse bridgeFee
  const bridgeFeeHex = BigInt(bridgeFee).toString(16).padStart(16, '0');

  // parse networkFee
  const networkFeeHex = BigInt(networkFee).toString(16).padStart(16, '0');

  // parse toAddress
  const addressHex = encodeAddress(toChain, toAddress);
  const addressLengthCode = (addressHex.length / 2)
    .toString(16)
    .padStart(2, '0');

  return Promise.resolve(
    toChainHex + bridgeFeeHex + networkFeeHex + addressLengthCode + addressHex,
  );
};

/**
 * gets confirmed and unspent boxes of an address that contains given rune
 * @param address the address
 * @param runeId the rune ID
 * @param offset
 * @param limit
 * @returns list of boxes
 */
export const getAddressRunesBoxes = async (
  address: string,
  runeId: string,
  offset: number,
  limit: number,
): Promise<Array<BitcoinRunesUtxo>> => {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (process.env.BITCOIN_RUNES_SECRET) {
      Object.assign(headers, {
        'x-api-key': process.env.BITCOIN_RUNES_SECRET,
      });
    }

    const response = await Axios.get<
      UnisatResponse<UnisatAddressRunesUtxos | undefined>
    >(
      `${process.env.BITCOIN_RUNES_API}/v1/indexer/address/${address}/runes/${runeId}/utxo?start=${offset}&limit=${limit}`,
      { headers },
    );

    if (!response.data?.data) return [];
    const utxos = response.data.data.utxo;
    return utxos.map((utxo) => ({
      txId: utxo.txid,
      index: utxo.vout,
      value: BigInt(utxo.satoshi),
      runes: utxo.runes.map((rune) => ({
        runeId: rune.runeid,
        quantity: BigInt(rune.amount),
      })),
    }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    const baseError = `Failed to get UTxOs conataining rune [${runeId}] for address [${address}] with offset/limit [${offset}/${limit}] from Unisat: `;
    if (e.response) {
      throw new Error(baseError + `${JsonBigInt.stringify(e.response.data)}`);
    }
    throw new Error(baseError + e.message);
  }
};

/**
 * gets confirmed and unspent boxes of an address that contains no rune
 * @param address the address
 * @returns list of boxes
 */
export const getAddressBtcBoxes = async (
  address: string,
): Promise<Array<BitcoinRunesUtxo>> => {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (process.env.BITCOIN_RUNES_SECRET) {
      Object.assign(headers, {
        'x-api-key': process.env.BITCOIN_RUNES_SECRET,
      });
    }

    const response = await Axios.get<
      UnisatResponse<UnisatAddressBtcUtxos | undefined>
    >(
      `${process.env.BITCOIN_RUNES_API}/v1/indexer/address/${address}/available-utxo-data?cursor=0&size=100`,
      { headers },
    );

    if (!response.data.data) return [];
    const utxos = response.data.data.utxo;
    return utxos.map((utxo) => ({
      txId: utxo.txid,
      index: utxo.vout,
      value: BigInt(utxo.satoshi),
      runes: [],
    }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    const baseError = `Failed to get UTxOs conataining BTC only for address [${address}] from Unisat: `;
    if (e.response) {
      throw new Error(baseError + `${JsonBigInt.stringify(e.response.data)}`);
    }
    throw new Error(baseError + e.message);
  }
};

/**
 * gets current fee ratio of the network
 * @returns
 */
export const getFeeRatio = async (): Promise<number> => {
  const esploraUrl = process.env.BITCOIN_ESPLORA_API;
  const FEE_ESTIMATES = `${esploraUrl}/api/fee-estimates`;
  const res = await Axios.get<Record<string, number>>(FEE_ESTIMATES);
  return res.data[CONFIRMATION_TARGET];
};

/**
 * submits a transaction
 * @param serializedPsbt psbt in base64 or hex format
 * @param encoding psbt encoding ('base64' or 'hex')
 */
export const submitTransaction = async (
  serializedPsbt: string,
  encoding: 'base64' | 'hex',
): Promise<string> => {
  const esploraUrl = process.env.BITCOIN_ESPLORA_API;
  const POST_TX = `${esploraUrl}/api/tx`;

  const psbt =
    encoding === 'base64'
      ? Psbt.fromBase64(serializedPsbt)
      : Psbt.fromHex(serializedPsbt);

  psbt.finalizeAllInputs();

  const res = await Axios.post<string>(
    POST_TX,
    psbt.extractTransaction().toHex(),
  );

  return res.data;
};

export const getHeight = async (): Promise<number> => {
  const response = await fetch(
    `${process.env.BITCOIN_ESPLORA_API}/api/blocks/tip/height`,
  );

  const height = await response.json();

  return height;
};

export const calculateFee = calculateFeeCreator(
  NETWORKS['bitcoin-runes'].key,
  getHeight,
);

export const getMinTransferCreator = getMinTransferCreatorBase(
  NETWORKS['bitcoin-runes'].key,
  calculateFee,
);

/**
 * estimates the virtual size of the transaciton based on the number of inputs, OP_RETURN output script, number of native segwit and taproot outputs
 * @param inputSize
 * @param opReturnScriptLength
 * @param nativeSegwitOutputSize
 * @param taprootOutputSize
 */
const estimateTxVsize = (
  inputSize: number,
  opReturnScriptLength: number,
  nativeSegwitOutputSize: number,
  taprootOutputSize: number,
): number => {
  const txBaseWeight = 40 + 2; // all txs include 40W. P2WPKH txs need additional 2W
  const opReturnWeightUnit =
    36 + // OP_RETURN base output weight
    opReturnScriptLength * 4; // OP_RETURN output data counts as vSize, so weight = script length * 4
  const inputsWeight = inputSize * TAPROOT_INPUT_WEIGHT_UNIT;
  const outputWeight =
    nativeSegwitOutputSize * SEGWIT_OUTPUT_WEIGHT_UNIT +
    taprootOutputSize * TAPROOT_OUTPUT_WEIGHT_UNIT;

  return (txBaseWeight + inputsWeight + opReturnWeightUnit + outputWeight) / 4;
};

/**
 * generates fee estimator for tx based on the OP_RETURN data length and type of the outputs
 * @param opReturnScriptLength
 * @param feeRatio
 * @param preSelectedInputCount
 * @param nativeSegwitOutputSize
 * @param taprootOutputSize
 */
export const generateFeeEstimatorWithAssumptions = (
  opReturnScriptLength: number,
  feeRatio: number,
  preSelectedInputCount: number,
  nativeSegwitOutputSize: number,
  taprootOutputSize: number,
): FeeEstimator<BitcoinRunesUtxo> => {
  return (
    selectedBoxes: Array<BitcoinRunesUtxo>,
    changeBoxesCount: number,
  ): bigint => {
    const estimatedVsize = estimateTxVsize(
      selectedBoxes.length + preSelectedInputCount,
      opReturnScriptLength,
      nativeSegwitOutputSize,
      taprootOutputSize + changeBoxesCount, // There is always a taproot change output
    );
    return BigInt(Math.ceil(estimatedVsize * feeRatio));
  };
};
