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
  CONFIRMATION_TARGET,
  FIRO_TX_BASE_SIZE,
  FIRO_INPUT_SIZE,
  MINIMUM_UTXO_VALUE,
  FIRO_OUTPUT_SIZE,
  FIRO_NETWORK,
} from './constants';
import type {
  FiroRpcBalance,
  FiroRpcNetworkInfo,
  FiroRpcResponse,
  FiroRpcSmartFee,
  FiroRpcUtxo,
  FiroUtxo,
} from './types';

const FIRO_DECIMALS = 100000000;

const getFiroRpcUrl = () => {
  const rpcUrl = process.env.FIRO_RPC_API;
  if (!rpcUrl) throw Error('FIRO_RPC_API is not set');
  return rpcUrl.replace(/\/+$/, '');
};

const firoToSatoshis = (value: number | string): bigint => {
  if (typeof value === 'number' || value.toLowerCase().includes('e')) {
    return BigInt(Math.round(Number(value) * FIRO_DECIMALS));
  }

  const [integer, fraction = ''] = value.split('.');
  return BigInt(`${integer}${fraction.padEnd(8, '0').slice(0, 8)}`);
};

const readCompactSize = (buffer: Buffer, offset: number) => {
  const first = buffer[offset];
  if (first === undefined) throw Error('Invalid Firo transaction hex');

  if (first < 0xfd) return { value: first, size: 1 };
  if (first === 0xfd) {
    if (offset + 3 > buffer.length) throw Error('Invalid Firo transaction hex');
    return { value: buffer.readUInt16LE(offset + 1), size: 3 };
  }
  if (first === 0xfe) {
    if (offset + 5 > buffer.length) throw Error('Invalid Firo transaction hex');
    return { value: buffer.readUInt32LE(offset + 1), size: 5 };
  }

  if (offset + 9 > buffer.length) throw Error('Invalid Firo transaction hex');
  const value = buffer.readBigUInt64LE(offset + 1);
  if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw Error('Unsupported Firo transaction field size');
  }
  return { value: Number(value), size: 9 };
};

const callFiroRpc = async <T>(
  method: string,
  params: Array<unknown> = [],
): Promise<T> => {
  const rpcUrl = getFiroRpcUrl();

  const res = await Axios.post<FiroRpcResponse<T>>(
    rpcUrl,
    {
      jsonrpc: '1.0',
      id: 'rosen-ui',
      method,
      params,
    },
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );

  if (res.data.error) {
    throw Error(`Firo RPC ${method} failed: ${res.data.error.message}`);
  }

  return res.data.result;
};

const assertBytes = (buffer: Buffer, offset: number, size: number) => {
  if (offset + size > buffer.length)
    throw Error('Invalid Firo transaction hex');
};

const stripFiroExtraPayload = (txHex: string) => {
  const buffer = Buffer.from(txHex, 'hex');
  assertBytes(buffer, 0, 4);

  const versionAndType = buffer.readUInt32LE(0);
  const version = versionAndType & 0xffff;
  const type = versionAndType >>> 16;
  if (version !== 3 || type === 0) return txHex;

  let offset = 4;
  let compactSize = readCompactSize(buffer, offset);
  offset += compactSize.size;
  let inputCount = compactSize.value;

  let hasWitness = false;
  if (inputCount === 0) {
    assertBytes(buffer, offset, 1);
    const flags = buffer[offset];
    if (flags !== 0) {
      hasWitness = true;
      offset += 1;
      compactSize = readCompactSize(buffer, offset);
      offset += compactSize.size;
      inputCount = compactSize.value;
    }
  }

  for (let i = 0; i < inputCount; i++) {
    assertBytes(buffer, offset, 36);
    offset += 36;
    compactSize = readCompactSize(buffer, offset);
    offset += compactSize.size + compactSize.value;
    assertBytes(buffer, offset, 4);
    offset += 4;
  }

  compactSize = readCompactSize(buffer, offset);
  offset += compactSize.size;
  const outputCount = compactSize.value;

  for (let i = 0; i < outputCount; i++) {
    assertBytes(buffer, offset, 8);
    offset += 8;
    compactSize = readCompactSize(buffer, offset);
    offset += compactSize.size + compactSize.value;
  }

  if (hasWitness) {
    for (let i = 0; i < inputCount; i++) {
      compactSize = readCompactSize(buffer, offset);
      offset += compactSize.size;
      const witnessCount = compactSize.value;
      for (let j = 0; j < witnessCount; j++) {
        compactSize = readCompactSize(buffer, offset);
        offset += compactSize.size + compactSize.value;
      }
    }
  }

  assertBytes(buffer, offset, 4);
  offset += 4;
  if (offset === buffer.length) return txHex;

  compactSize = readCompactSize(buffer, offset);
  const payloadEnd = offset + compactSize.size + compactSize.value;
  if (payloadEnd !== buffer.length) {
    throw Error('Invalid Firo transaction extra payload');
  }

  // bitcoinjs-lib does not understand Firo special-transaction payloads.
  // The stripped form is only used as PSBT nonWitnessUtxo prevout material.
  return buffer.subarray(0, offset).toString('hex');
};

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
 * gets utxos by address from Firo RPC
 * @param address
 * @returns
 */
export const getAddressUtxos = async (
  address: string,
): Promise<Array<FiroUtxo>> => {
  const rpcUtxos = await callFiroRpc<Array<FiroRpcUtxo>>('getaddressutxos', [
    { addresses: [address] },
  ]);
  return rpcUtxos
    .filter((utxo) => utxo.height > 0)
    .map((utxo) => ({
      txId: utxo.txid,
      index: utxo.outputIndex,
      value: BigInt(utxo.satoshis),
    }));
};

/**
 * gets tx hex by txId from Firo RPC
 * @param txId
 * @returns
 */
export const getTxHex = async (txId: string): Promise<string> => {
  const txHex = await callFiroRpc<string>('getrawtransaction', [txId, false]);
  return stripFiroExtraPayload(txHex);
};

/**
 * gets address Firo balance from Firo RPC
 * @param address
 * @returns this is a UNWRAPPED-VALUE amount
 */
export const getAddressBalance = async (address: string): Promise<bigint> => {
  const balance = await callFiroRpc<FiroRpcBalance>('getaddressbalance', [
    { addresses: [address] },
  ]);
  return BigInt(balance.balance);
};

/**
 * gets current fee ratio of the network from Firo RPC
 * @returns
 */
export const getFeeRatio = async (): Promise<number> => {
  const smartFee = await callFiroRpc<FiroRpcSmartFee>('estimatesmartfee', [
    CONFIRMATION_TARGET,
  ]).catch(() => undefined);
  if (smartFee?.feerate && smartFee.feerate >= 0) {
    // Convert satoshis per KB to satoshis per byte
    return Number(firoToSatoshis(smartFee.feerate)) / 1000;
  }

  const feeEstimate = await callFiroRpc<number>('estimatefee', [
    CONFIRMATION_TARGET,
  ]).catch(() => undefined);
  if (feeEstimate && feeEstimate >= 0) {
    // Convert satoshis per KB to satoshis per byte
    return Number(firoToSatoshis(feeEstimate)) / 1000;
  }

  const networkInfo = await callFiroRpc<FiroRpcNetworkInfo>(
    'getnetworkinfo',
  ).catch(() => undefined);
  if (networkInfo?.relayfee && networkInfo.relayfee >= 0) {
    // Convert satoshis per KB to satoshis per byte
    return Number(firoToSatoshis(networkInfo.relayfee)) / 1000;
  }

  throw Error('Firo fee estimate is not available');
};

/**
 * gets the minimum amount of satoshi for a utxo that can cover
 * additional fee for adding it to a tx
 * @returns the minimum UNWRAPPED-VALUE amount
 */
export const getMinimumMeaningfulFiro = (feeRatio: number): bigint => {
  return BigInt(Math.ceil(feeRatio * FIRO_INPUT_SIZE)) + MINIMUM_UTXO_VALUE;
};

/**
 * estimates tx size based on number of inputs and outputs
 * inputs and outputs required fee are estimated by FIRO_INPUT_SIZE and FIRO_OUTPUT_SIZE
 * @param inputSize
 * @param outputSize
 * @param opReturnLength
 */
export const estimateTxSize = (
  inputSize: number,
  outputSize: number,
  opReturnLength: number,
): number => {
  const x =
    FIRO_TX_BASE_SIZE +
    11 + // OP_RETURN output base size
    opReturnLength / 2 + // OP_RETURN size in bytes
    inputSize * FIRO_INPUT_SIZE + // inputs size
    outputSize * FIRO_OUTPUT_SIZE; // outputs size
  return x;
};

/**
 * submits a transaction to Firo RPC
 * @param serializedPsbt psbt in base64 or hex format
 * @param encoding psbt encoding ('base64' or 'hex')
 */
export const submitTransaction = async (
  serializedPsbt: string,
  encoding: 'base64' | 'hex',
): Promise<string> => {
  const psbt =
    encoding === 'base64'
      ? Psbt.fromBase64(serializedPsbt)
      : Psbt.fromHex(serializedPsbt);
  psbt.finalizeAllInputs();
  const txHex = psbt.extractTransaction().toHex();

  return callFiroRpc<string>('sendrawtransaction', [txHex]);
};

export const isValidAddress = (addr: string) => {
  try {
    address.toOutputScript(addr, FIRO_NETWORK);
    return true;
  } catch {
    // If an error is thrown, the address is invalid
    return false;
  }
};

export const getHeight = async (): Promise<number> => {
  return callFiroRpc<number>('getblockcount');
};

export const calculateFee: CalculateFee = calculateFeeCreator(
  NETWORKS.firo.key,
  getHeight,
);

export const getMinTransferCreator = getMinTransferCreatorBase(
  NETWORKS.firo.key,
  calculateFee,
);
