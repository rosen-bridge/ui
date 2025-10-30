import { encodeAddress } from '@rosen-bridge/address-codec';
import {
  CalculateFee,
  calculateFeeCreator,
  getMinTransferCreator as getMinTransferCreatorBase,
} from '@rosen-network/base';
import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';
import Axios from 'axios';
import { MTX } from 'hsd';

import {
  CONFIRMATION_TARGET,
  SEGWIT_INPUT_WEIGHT_UNIT,
  SEGWIT_OUTPUT_WEIGHT_UNIT,
} from './constants';
import type { HandshakeUtxo } from './types';

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
 * gets utxos from Handshake wallet RPC
 * Note: This uses wallet RPC 'listunspent' which returns UTXOs for the connected wallet,
 * not for an arbitrary address. The address parameter is ignored for wallet RPC.
 * @param address - ignored, kept for API compatibility
 * @returns
 */
export const getAddressUtxos = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  address: string,
): Promise<Array<HandshakeUtxo>> => {
  const rpcUrl = process.env.HANDSHAKE_WALLET_RPC_API;
  if (!rpcUrl) throw new Error('HANDSHAKE_WALLET_RPC_API is not configured');

  const res = await Axios.post<{
    result: Array<{
      txid: string;
      vout: number;
      amount: number;
      confirmations: number;
      covenant: { type: number; action: string };
    }>;
  }>(rpcUrl, {
    method: 'listunspent',
    params: [],
  });

  // Filter only coin-type UTXOs (covenant type 0 = NONE)
  return res.data.result
    .filter((utxo) => utxo.covenant.type === 0)
    .map((utxo) => ({
      txId: utxo.txid,
      index: utxo.vout,
      value: BigInt(Math.floor(utxo.amount * 1e6)), // Convert HNS to dollarydoos (1 HNS = 1,000,000 dollarydoos)
    }));
};

/**
 * gets wallet HNS balance from Handshake wallet RPC
 * Note: This uses wallet RPC 'getbalance' which returns balance for the connected wallet,
 * not for an arbitrary address. The address parameter is ignored for wallet RPC.
 * @param address - ignored, kept for API compatibility
 * @returns this is a UNWRAPPED-VALUE amount in dollarydoos
 */
export const getAddressBalance = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  address: string,
): Promise<bigint> => {
  const rpcUrl = process.env.HANDSHAKE_WALLET_RPC_API;
  if (!rpcUrl) throw new Error('HANDSHAKE_WALLET_RPC_API is not configured');

  const res = await Axios.post<{ result: number }>(rpcUrl, {
    method: 'getbalance',
    params: [],
  });

  // Convert HNS to dollarydoos (1 HNS = 1,000,000 dollarydoos)
  // getbalance returns confirmed balance in HNS (6 decimals)
  return BigInt(Math.floor(res.data.result * 1e6));
};

/**
 * gets current fee ratio of the network
 * @returns fee rate in dollarydoos per byte
 */
export const getFeeRatio = async (): Promise<number> => {
  const rpcUrl = process.env.HANDSHAKE_RPC_API;
  if (!rpcUrl) throw new Error('HANDSHAKE_RPC_API is not configured');

  const res = await Axios.post<{ result: number }>(rpcUrl, {
    method: 'estimatefee',
    params: [CONFIRMATION_TARGET],
  });

  // estimatefee returns HNS per KB
  // Convert from HNS/KB to dollarydoos/byte
  const feeRateHnsPerKb = res.data.result;
  const feeDollarydoosPerKb = feeRateHnsPerKb * 1e6; // HNS to dollarydoos
  const feeDollarydoosPerByte = feeDollarydoosPerKb / 1024; // KB to byte

  return Math.ceil(feeDollarydoosPerByte) || 20; // Default to 20 dollarydoos/byte if 0
};

/**
 * gets the minimum amount of dollarydoos for a utxo that can cover
 * additional fee for adding it to a tx
 * @returns the minimum UNWRAPPED-VALUE amount
 */
export const getMinimumMeaningfulSatoshi = (feeRatio: number): bigint => {
  const minSat = BigInt(
    Math.ceil(
      (feeRatio * SEGWIT_INPUT_WEIGHT_UNIT) / 4, // estimate fee per weight and convert to virtual size
    ),
  );
  return minSat > 294n ? minSat : 294n;
};

/**
 * estimates tx weight based on number of inputs and outputs
 * inputs and outputs required fee are estimated by segwit weight unit
 * @param inputSize
 * @param outputSize
 * @param opReturnLength
 */
export const estimateTxWeight = (
  inputSize: number,
  outputSize: number,
  opReturnLength: number,
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
 * submits a transaction
 * @param serializedMtx mtx in hex format
 */
export const submitTransaction = async (
  serializedMtx: string,
): Promise<string> => {
  const rpcUrl = process.env.HANDSHAKE_RPC_API;
  if (!rpcUrl) throw new Error('HANDSHAKE_RPC_API is not configured');

  const mtx = MTX.fromHex(serializedMtx);

  const res = await Axios.post<{ result: string }>(rpcUrl, {
    method: 'sendrawtransaction',
    params: [mtx.toHex()],
  });

  return res.data.result;
};

export const getHeight = async (): Promise<number> => {
  const rpcUrl = process.env.HANDSHAKE_RPC_API;
  if (!rpcUrl) throw new Error('HANDSHAKE_RPC_API is not configured');

  const res = await Axios.post<{ result: { blocks: number } }>(rpcUrl, {
    method: 'getblockchaininfo',
    params: [],
  });

  return res.data.result.blocks;
};

export const calculateFee: CalculateFee = calculateFeeCreator(
  NETWORKS.handshake.key,
  getHeight,
);

export const getMinTransferCreator = getMinTransferCreatorBase(
  NETWORKS.handshake.key,
  calculateFee,
);
