import { FeeEstimator } from '@rosen-bridge/abstract-box-selection';
import { encodeAddress } from '@rosen-bridge/address-codec';
import { BitcoinRunesUtxo } from '@rosen-bridge/bitcoin-runes-utxo-selection';
import {
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
  TAPROOT_OUTPUT_WEIGHT_UNIT,
} from './constants';
import type {
  EsploraAddress,
  OrdiscanAddressUTXO,
  OrdiscanResponse,
  OrdiscanRuneInfo,
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
 * gets utxos by address from ordiscan
 * @param address
 * @returns
 */
export const getAddressUtxos = async (
  address: string,
): Promise<Array<BitcoinRunesUtxo>> => {
  // TODO: pagination ?
  const ordiscanUrl = process.env.BITCOIN_RUNES_API;
  const ordiscanToken = process.env.BITCOIN_RUNES_SECRET;
  const GET_ADDRESS_UTXOS = `${ordiscanUrl}/v1/address/${address}/utxos`;

  const res = await Axios.get<OrdiscanResponse<Array<OrdiscanAddressUTXO>>>(
    GET_ADDRESS_UTXOS,
    {
      headers: { Authorization: `Bearer ${ordiscanToken}` },
    },
  );

  const runeNames: Set<string> = new Set();
  for (const utxo of res.data.data) {
    for (const rune of utxo.runes) {
      runeNames.add(rune.name);
    }
  }

  const runeNameToIdMap: Map<string, string> = new Map();
  for (const runeName of runeNames) {
    const runeInfo = await getRuneInfo(runeName);
    runeNameToIdMap.set(runeName, runeInfo.id);
  }

  return res.data.data.map((utxo) => {
    const [txId, vout] = utxo.outpoint.split(':');

    return {
      txId: txId,
      index: Number(vout),
      value: BigInt(utxo.value),
      runes: utxo.runes.map((rune) => {
        const runeId = runeNameToIdMap.get(rune.name)!;
        return {
          runeId,
          quantity: BigInt(rune.balance),
        };
      }),
    };
  });
};

/**
 * gets info of a rune
 * @param runeName
 * @returns
 */
export const getRuneInfo = async (
  runeName: string,
): Promise<OrdiscanRuneInfo> => {
  const ordiscanUrl = process.env.BITCOIN_RUNES_API;
  const ordiscanToken = process.env.BITCOIN_RUNES_SECRET;
  const GET_RUNE_INFO = `${ordiscanUrl}/v1/rune/${runeName}`;

  const res = await Axios.get<OrdiscanResponse<OrdiscanRuneInfo>>(
    GET_RUNE_INFO,
    {
      headers: { Authorization: `Bearer ${ordiscanToken}` },
    },
  );

  return res.data.data;
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

    // Ensure the address does start with 'bc1p' (Taproot)
    if (addr.startsWith('bc1q')) {
      return true;
    }

    return false;
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
  const inputsWeight = inputSize * SEGWIT_INPUT_WEIGHT_UNIT;
  const outputWeight =
    nativeSegwitOutputSize * SEGWIT_OUTPUT_WEIGHT_UNIT +
    taprootOutputSize * TAPROOT_OUTPUT_WEIGHT_UNIT;

  return (txBaseWeight + inputsWeight + opReturnWeightUnit + outputWeight) / 4;
};

/**
 * generates fee estimator for tx based on the OP_RETURN data length and type of the outputs
 * @param opReturnScriptLength
 * @param feeRatio
 * @param nativeSegwitOutputSize
 * @param taprootOutputSize
 */
export const generateFeeEstimatorWithAssumptions = (
  opReturnScriptLength: number,
  feeRatio: number,
  nativeSegwitOutputSize: number,
  taprootOutputSize: number,
): FeeEstimator<BitcoinRunesUtxo> => {
  return (
    selectedBoxes: Array<BitcoinRunesUtxo>,
    changeBoxesCount: number,
  ): bigint => {
    const estimatedVsize = estimateTxVsize(
      selectedBoxes.length,
      opReturnScriptLength,
      nativeSegwitOutputSize + changeBoxesCount, // There is always a native-segwit change output
      taprootOutputSize,
    );
    return BigInt(Math.ceil(estimatedVsize * feeRatio));
  };
};
