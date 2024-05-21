import { encodeAddress } from '@rosen-bridge/address-codec';
import Axios from 'axios';
import { Psbt } from 'bitcoinjs-lib';

import { CONFIRMATION_TARGET, SUPPORTED_CHAINS } from './constants';
import { BitcoinUtxo, EsploraAddress, EsploraUtxo } from './types';

/**
 * generates metadata for lock transaction
 * @param toChain
 * @param toAddress
 * @param fromAddress
 * @param networkFee
 * @param bridgeFee
 * @returns
 */
export const generateOpReturnData = (
  toChain: string,
  toAddress: string,
  networkFee: string,
  bridgeFee: string
): string => {
  // parse toChain
  const toChainCode = SUPPORTED_CHAINS.indexOf(toChain);
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

  return (
    toChainHex + bridgeFeeHex + networkFeeHex + addressLengthCode + addressHex
  );
};

/**
 * gets utxos by address from Esplora
 * @param address
 * @returns
 */
export const getAddressUtxos = async (
  address: string
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
 * @returns
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
 * @param psbtBase64 psbt in base64 format
 */
export const submitTransaction = async (
  psbtBase64: string
): Promise<string> => {
  const esploraUrl = process.env.BITCOIN_ESPLORA_API;
  const POST_TX = `${esploraUrl}/api/tx`;

  const psbt = Psbt.fromBase64(psbtBase64);
  const res = await Axios.post<string>(
    POST_TX,
    psbt.extractTransaction().toHex()
  );
  return res.data;
};
