import { encodeAddress } from '@rosen-bridge/address-codec';
import {
  BitcoinRunesBoxSelection,
  BitcoinRunesUtxo,
  CoveringBoxes,
  FeeEstimator,
} from '@rosen-bridge/bitcoin-runes-utxo-selection';
import JsonBigInt from '@rosen-bridge/json-bigint';
import {
  CalculateFee,
  calculateFeeCreator,
  getMinTransferCreator as getMinTransferCreatorBase,
} from '@rosen-network/base';
import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';
import Axios from 'axios';
import { Psbt } from 'bitcoinjs-lib';
import * as bitcoinJs from 'bitcoinjs-lib';

import {
  CONFIRMATION_TARGET,
  GET_BOX_API_LIMIT,
  MINIMUM_BTC_FOR_NATIVE_SEGWIT_OUTPUT,
  SEGWIT_OUTPUT_WEIGHT_UNIT,
  TAPROOT_INPUT_WEIGHT_UNIT,
  TAPROOT_OUTPUT_WEIGHT_UNIT,
} from './constants';
import type {
  EsploraUtxo,
  UnisatAddressAvailableBtcUtxos,
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
 * submits a get request to unisat api
 * @param path
 * @returns UnisatResponse
 */
export const requestUnisat = async <T>(
  path: string,
): Promise<UnisatResponse<T | undefined>> => {
  const headers = { 'Content-Type': 'application/json' };
  if (process.env.BITCOIN_RUNES_SECRET) {
    Object.assign(headers, {
      Authorization: `Bearer ${process.env.BITCOIN_RUNES_SECRET}`,
    });
  }

  const response = await Axios.get<UnisatResponse<T | undefined>>(
    `${process.env.BITCOIN_RUNES_API}${path}`,
    { headers },
  );

  return response.data;
};

/**
 * gets confirmed and unspent boxes of an address
 * @param requiredBtc
 * @param preSelectedBoxes
 * @param utxos
 * @param runestoneLength
 * @param lockDataChunksLength
 * @param feeRatio
 * @returns list of boxes
 */
export const getAdditionalBoxes = async (
  requiredBtc: bigint,
  preSelectedBoxes: BitcoinRunesUtxo[],
  utxos: AsyncGenerator<BitcoinRunesUtxo>,
  runestoneLength: number,
  lockDataChunksLength: number,
  feeRatio: number,
): Promise<CoveringBoxes<BitcoinRunesUtxo>> => {
  const feeEstimator = generateFeeEstimatorWithAssumptions(
    runestoneLength,
    feeRatio,
    preSelectedBoxes.length,
    lockDataChunksLength + 1, // multiple utxos for data chunks, 1 utxo to lock address
    0,
  );

  // fetch input boxes to cover required BTC
  const boxSelection = new BitcoinRunesBoxSelection();
  const coveredBtcBoxes = await boxSelection.getCoveringBoxes(
    { nativeToken: requiredBtc, tokens: [] },
    preSelectedBoxes.map((box) => `${box.txId}.${box.index}`),
    new Map(),
    utxos,
    MINIMUM_BTC_FOR_NATIVE_SEGWIT_OUTPUT,
    undefined,
    feeEstimator,
  );

  return coveredBtcBoxes;
};

/**
 * gets the current address's available UTXO list that can be used for BTC spending
 *
 * Note: UTXOs of assets such as inscriptions, runes, and alkanes will not be included
 * Note: UTXOs with less than 600 satoshis will not be returned to avoid potential
 *  unspendable outputs from unrecognized asset protocols or burns
 * @param address the address
 * @param offset
 * @param limit
 * @returns list of boxes
 */
export async function* getAddressAvailableBtcUtxos(
  address: string,
  startOffset: number = 0,
  limit: number = GET_BOX_API_LIMIT,
): AsyncGenerator<BitcoinRunesUtxo, undefined> {
  let offset = startOffset;
  let hasMorePages = true;

  while (hasMorePages) {
    try {
      const response = await requestUnisat<UnisatAddressAvailableBtcUtxos>(
        `/v1/indexer/address/${address}/available-utxo-data?cursor=${offset}&size=${limit}`,
      );
      const utxos = response.data?.utxo ?? [];
      if (utxos.length < limit) {
        hasMorePages = false;
      }

      const page = utxos.map((utxo) => ({
        txId: utxo.txid,
        index: utxo.vout,
        value: BigInt(utxo.satoshi),
        runes: [],
      }));

      yield* page;

      offset += limit;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      const baseError = `Failed to get available UTxOs containing BTC only for address [${address}] with offset/limit [${offset}/${limit}] from Unisat: `;
      if (e.response) {
        throw new Error(baseError + `${JsonBigInt.stringify(e.response.data)}`);
      }
      throw new Error(baseError + e.message);
    }
  }
}

/**
 * gets confirmed and unspent boxes of an address
 * @param address the address
 * @param startOffset
 * @param limit
 * @returns list of boxes
 */
export async function* getAddressAllBtcUtxos(
  address: string,
  startOffset: number = 0,
  limit: number = GET_BOX_API_LIMIT,
): AsyncGenerator<BitcoinRunesUtxo, undefined> {
  let offset = startOffset;
  let hasMorePages = true;

  while (hasMorePages) {
    try {
      const response = await requestUnisat<UnisatAddressBtcUtxos>(
        `/v1/indexer/address/${address}/all-utxo-data?cursor=${offset}&size=${limit}`,
      );
      const utxos = response.data?.utxo ?? [];
      if (utxos.length < limit) {
        hasMorePages = false;
      }

      const page = utxos.map((utxo) => ({
        txId: utxo.txid,
        index: utxo.vout,
        value: BigInt(utxo.satoshi),
        runes: [],
      }));

      yield* page;

      offset += limit;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      const baseError = `Failed to get all UTxOs containing BTC only for address [${address}] with offset/limit [${offset}/${limit}] from Unisat: `;
      if (e.response) {
        throw new Error(baseError + `${JsonBigInt.stringify(e.response.data)}`);
      }
      throw new Error(baseError + e.message);
    }
  }
}

/**
 * gets confirmed and unspent boxes of an address that contains given rune
 * @param address the address
 * @param runeId the rune ID
 * @param startOffset
 * @param limit
 * @returns list of boxes
 */
export async function* getAddressRunesUtxos(
  address: string,
  runeId: string,
  startOffset: number = 0,
  limit: number = GET_BOX_API_LIMIT,
): AsyncGenerator<BitcoinRunesUtxo, undefined> {
  let offset = startOffset;
  let hasMorePages = true;

  while (hasMorePages) {
    try {
      const response = await requestUnisat<UnisatAddressRunesUtxos>(
        `/v1/indexer/address/${address}/runes/${runeId}/utxo?start=${offset}&limit=${limit}`,
      );
      const utxos = response.data?.utxo ?? [];
      if (utxos.length < limit) {
        hasMorePages = false;
      }

      const page = utxos.map((utxo) => ({
        txId: utxo.txid,
        index: utxo.vout,
        value: BigInt(utxo.satoshi),
        runes: utxo.runes.map((rune) => ({
          runeId: rune.runeid,
          quantity: BigInt(rune.amount),
        })),
      }));

      yield* page;

      offset += limit;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      const baseError = `Failed to get UTxOs containing rune [${runeId}] for address [${address}] with offset/limit [${offset}/${limit}] from Unisat: `;
      if (e.response) {
        throw new Error(baseError + `${JsonBigInt.stringify(e.response.data)}`);
      }
      throw new Error(baseError + e.message);
    }
  }
}

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

export const calculateFee: CalculateFee = calculateFeeCreator(
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
      nativeSegwitOutputSize + changeBoxesCount, // There is always a native segwit change output
      taprootOutputSize,
    );
    return BigInt(Math.ceil(estimatedVsize * feeRatio));
  };
};

/**
 * gets utxos by address from Esplora
 * @param address
 * @returns array of BitcoinRunesUtxo
 */
export async function* getEsploraAddressUtxos(
  address: string,
): AsyncGenerator<BitcoinRunesUtxo, undefined> {
  const esploraUrl = process.env.BITCOIN_ESPLORA_API;
  const GET_ADDRESS_UTXOS = `${esploraUrl}/api/address/${address}/utxo`;
  const response = await Axios.get<Array<EsploraUtxo>>(GET_ADDRESS_UTXOS);

  for (const record of response.data) {
    yield {
      txId: record.txid,
      index: record.vout,
      value: BigInt(record.value),
      runes: [],
    };
  }
}

/**
 * makes a taproot payment object
 * @param internalPubkey
 * @param address
 * @returns taproot payment
 */
export const makeTaprootPayment = (
  internalPubkey: string,
  address: string,
): bitcoinJs.payments.Payment => {
  const payment = bitcoinJs.payments.p2tr({
    internalPubkey: Buffer.from(internalPubkey, 'hex'),
  });

  if (!payment.output) throw Error(`failed to extract taproot output script!`);
  if (!payment.address) throw Error(`failed to extract taproot address!`);
  if (payment.address !== address)
    throw Error(
      `the calculated taproot address by public key is not equal to address!`,
    );

  return payment;
};

/**
 * makes a p2wpkh payment object
 * @param address
 * @returns p2wpkh payment
 */
export const makeP2wpkhPayment = (
  address: string,
): bitcoinJs.payments.Payment => {
  const payment = bitcoinJs.payments.p2wpkh({
    address,
  });

  if (!payment.output) throw Error(`failed to extract p2wpkh output script!`);
  if (!payment.address) throw Error(`failed to extract p2wpkh address!`);
  if (payment.address !== address)
    throw Error(
      `the calculated p2wpkh address by public key is not equal to address!`,
    );

  return payment;
};
