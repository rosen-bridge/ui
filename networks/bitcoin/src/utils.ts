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
  SEGWIT_INPUT_WEIGHT_UNIT,
  SEGWIT_OUTPUT_WEIGHT_UNIT,
} from './constants';
import type { BitcoinUtxo, EsploraAddress, EsploraUtxo } from './types';

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
): Promise<Array<BitcoinUtxo>> => {
  const esploraUrl = process.env.BITCOIN_ESPLORA_API;
  const GET_ADDRESS_UTXOS = `${esploraUrl}/api/address/${address}/utxo`;
  const res = await Axios.get<Array<EsploraUtxo>>(GET_ADDRESS_UTXOS);
  return res.data.map((utxo) => ({
    txId: utxo.txid,
    index: utxo.vout,
    value: BigInt(utxo.value),
  }));
};

/**
 * gets address BTC balance from Esplora
 * @param address
 * @returns this is a UNWRAPPED-VALUE amount
 */
export const getAddressBalance = async (address: string): Promise<bigint> => {
  const esploraUrl = process.env.BITCOIN_ESPLORA_API;
  const GET_ADDRESS = `${esploraUrl}/api/address/${address}`;
  const res = await Axios.get<EsploraAddress>(GET_ADDRESS);

  const chainStat = res.data.chain_stats;
  return BigInt(chainStat.funded_txo_sum - chainStat.spent_txo_sum);
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
 * gets the minimum amount of satoshi for a utxo that can cover
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
 * @param feeRatio
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

export const isValidAddress = (addr: string) => {
  try {
    // Decode the address using fromBech32
    const decoded = address.fromBech32(addr);

    // Check if the decoded prefix matches the expected prefix for Bitcoin
    if (decoded.prefix !== 'bc') {
      return false;
    }

    // Ensure the address does not start with 'bc1p' (Taproot)
    if (addr.startsWith('bc1p')) {
      return false;
    }

    // Ensure the address is either P2WPKH or P2WSH
    if (decoded.version === 0) {
      return true; // P2WPKH or P2WSH
    } else {
      return false;
    }
  } catch {
    // If an error is thrown, the address is invalid
    return false;
  }
};

export const getHeight = async (): Promise<number> => {
  const response = await fetch(
    `${process.env.BITCOIN_ESPLORA_API}/api/blocks/tip/height`,
  );

  const height = await response.json();

  return height;
};

export const calculateFee: CalculateFee = calculateFeeCreator(
  NETWORKS.bitcoin.key,
  getHeight,
);

export const getMinTransferCreator = getMinTransferCreatorBase(
  NETWORKS.bitcoin.key,
  calculateFee,
);
