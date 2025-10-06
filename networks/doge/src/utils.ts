import { encodeAddress } from '@rosen-bridge/address-codec';
import {
  CalculateFee,
  calculateFeeCreator,
  getMinTransferCreator as getMinTransferCreatorBase,
} from '@rosen-network/base';
import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';
import Axios from 'axios';
import { Psbt, address } from 'bitcoinjs-lib';

import {
  DOGE_TX_BASE_SIZE,
  DOGE_INPUT_SIZE,
  MINIMUM_UTXO_VALUE,
  DOGE_OUTPUT_SIZE,
  DOGE_NETWORK,
} from './constants';
import type { DogeUtxo, BlockCypherAddress } from './types';

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
 * gets utxos by address from BlockCypher
 * @param address
 * @returns
 */
export const getAddressUtxos = async (
  address: string,
): Promise<Array<DogeUtxo>> => {
  const blockcypherUrl = `${process.env.DOGE_BLOCKCYPHER_API}`;
  const GET_ADDRESS = `${blockcypherUrl}/v1/doge/main/addrs/${address}?unspentOnly=true&limit=500`;
  const res = await Axios.get<BlockCypherAddress>(GET_ADDRESS);

  return res.data.txrefs.map((txref) => ({
    txId: txref.tx_hash,
    index: txref.tx_output_n,
    value: BigInt(txref.value),
  }));
};

/**
 * gets tx hex by txId from BlockCypher
 * @param txId
 * @returns
 */
export const getTxHex = async (txId: string): Promise<string> => {
  const blockcypherUrl = `${process.env.DOGE_BLOCKCYPHER_API}`;
  const GET_TX = `${blockcypherUrl}/v1/doge/main/txs/${txId}?includeHex=true`;
  const res = await Axios.get<{ hex: string }>(GET_TX);
  return res.data.hex;
};

/**
 * gets address Doge balance from BlockCypher
 * @param address
 * @returns this is a UNWRAPPED-VALUE amount
 */
export const getAddressBalance = async (address: string): Promise<bigint> => {
  const blockcypherUrl = `${process.env.DOGE_BLOCKCYPHER_API}`;
  const GET_ADDRESS = `${blockcypherUrl}/v1/doge/main/addrs/${address}`;
  const res = await Axios.get<BlockCypherAddress>(GET_ADDRESS);
  return BigInt(res.data.final_balance);
};

/**
 * gets current fee ratio of the network from BlockCypher
 * @returns
 */
export const getFeeRatio = async (): Promise<number> => {
  const blockcypherUrl = `${process.env.DOGE_BLOCKCYPHER_API}`;
  const GET_CHAIN = `${blockcypherUrl}/v1/doge/main`;
  const res = await Axios.get<{ high_fee_per_kb: number }>(GET_CHAIN);
  // Convert satoshis per KB to satoshis per byte
  return res.data.high_fee_per_kb / 1000;
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
 * submits a transaction to BlockCypher
 * @param serializedPsbt psbt in base64 or hex format
 * @param encoding psbt encoding ('base64' or 'hex')
 */
export const submitTransaction = async (
  serializedPsbt: string,
  encoding: 'base64' | 'hex',
): Promise<string> => {
  const blockcypherUrl = `${process.env.DOGE_BLOCKCYPHER_API}`;
  const POST_TX = `${blockcypherUrl}/v1/doge/main/txs/push`;

  const psbt =
    encoding === 'base64'
      ? Psbt.fromBase64(serializedPsbt)
      : Psbt.fromHex(serializedPsbt);
  psbt.finalizeAllInputs();
  const txHex = psbt.extractTransaction().toHex();

  const res = await Axios.post<{ tx: { hash: string } }>(POST_TX, {
    tx: txHex,
  });
  return res.data.tx.hash;
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

export const getHeight = async (): Promise<number> => {
  const response = await fetch(
    `${process.env.DOGE_BLOCKCYPHER_API}/v1/doge/main`,
  );

  const data = await response.json();

  const height = data.height;

  return height;
};

export const calculateFee: CalculateFee = calculateFeeCreator(
  NETWORKS.doge.key,
  getHeight,
);

export const getMinTransferCreator = getMinTransferCreatorBase(
  NETWORKS.doge.key,
  calculateFee,
);
