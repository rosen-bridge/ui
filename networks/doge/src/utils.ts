import { encodeAddress } from '@rosen-bridge/address-codec';
import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';
import Axios from 'axios';
import { Psbt, address } from 'bitcoinjs-lib';

import {
  CONFIRMATION_TARGET,
  DOGE_TX_BASE_SIZE,
  DOGE_INPUT_SIZE,
  MINIMUM_UTXO_VALUE,
  DOGE_OUTPUT_SIZE,
  DOGE_NETWORK,
} from './constants';
import type { DogeUtxo, EsploraAddress, EsploraUtxo } from './types';

/**
 * generates metadata for lock transaction
 * @param toChain
 * @param toAddress
 * @param fromAddress
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
 * gets utxos by address from Esplora
 * @param address
 * @returns
 */
export const getAddressUtxos = async (
  address: string,
): Promise<Array<DogeUtxo>> => {
  const esploraUrl = `${process.env.DOGE_ESPLORA_API}${process.env.DOGE_ESPLORA_API_PREFIX}`;
  const GET_ADDRESS_UTXOS = `${esploraUrl}/address/${address}/utxo`;
  const res = await Axios.get<Array<EsploraUtxo>>(GET_ADDRESS_UTXOS);
  return res.data.map((utxo) => ({
    txId: utxo.txid,
    index: utxo.vout,
    value: BigInt(utxo.value),
  }));
};

/**
 * gets tx hex by txId from Esplora
 * @param txId
 * @returns
 */
export const getTxHex = async (txId: string): Promise<string> => {
  const esploraUrl = `${process.env.DOGE_ESPLORA_API}${process.env.DOGE_ESPLORA_API_PREFIX}`;
  const GET_TX_HEX = `${esploraUrl}/tx/${txId}/hex`;
  const res = await Axios.get<string>(GET_TX_HEX);
  return res.data;
};

/**
 * gets address BTC balance from Esplora
 * @param address
 * @returns this is a UNWRAPPED-VALUE amount
 */
export const getAddressBalance = async (address: string): Promise<bigint> => {
  const esploraUrl = `${process.env.DOGE_ESPLORA_API}${process.env.DOGE_ESPLORA_API_PREFIX}`;
  const GET_ADDRESS = `${esploraUrl}/address/${address}`;
  const res = await Axios.get<EsploraAddress>(GET_ADDRESS);

  const chainStat = res.data.chain_stats;
  return BigInt(chainStat.funded_txo_sum - chainStat.spent_txo_sum);
};

/**
 * gets current fee ratio of the network
 * @returns
 */
export const getFeeRatio = async (): Promise<number> => {
  const esploraUrl = `${process.env.DOGE_ESPLORA_API}${process.env.DOGE_ESPLORA_API_PREFIX}`;
  const FEE_ESTIMATES = `${esploraUrl}/fee-estimates`;
  const res = await Axios.get<Record<string, number>>(FEE_ESTIMATES);
  return res.data[CONFIRMATION_TARGET];
};

/**
 * gets the minimum amount of satoshi for a utxo that can cover
 * additional fee for adding it to a tx
 * @returns the minimum UNWRAPPED-VALUE amount
 */
export const getMinimumMeaningfulDoge = (feeRatio: number): bigint => {
  return BigInt(Math.ceil(feeRatio * DOGE_INPUT_SIZE) + MINIMUM_UTXO_VALUE);
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
  opReturnLength: number,
): number => {
  const x =
    DOGE_TX_BASE_SIZE +
    2 + // all txs include 40W. P2WPKH txs need additional 2W
    44 + // OP_RETURN output base weight
    opReturnLength * 2 + // OP_RETURN output data counts as vSize, so weight = hexString length / 2 * 4
    inputSize * DOGE_INPUT_SIZE + // inputs weights
    outputSize * DOGE_OUTPUT_SIZE; // outputs weights
  return x;
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
  const esploraUrl = `${process.env.DOGE_ESPLORA_API}${process.env.DOGE_ESPLORA_API_PREFIX}`;
  const POST_TX = `${esploraUrl}/tx`;

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

export const isValidAddress = (addr: string) => {
  try {
    address.toOutputScript(addr, DOGE_NETWORK);
    return true;

  } catch {
    // If an error is thrown, the address is invalid
    return false;
  }
};
