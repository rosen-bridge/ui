import { TokenMap } from '@rosen-bridge/tokens';
import { Wallet } from '@rosen-ui/wallet-api';

import { generateUnsignedTx } from './generateUnsignedTx';
import type {
  generateOpReturnData,
  getAddressBalance,
  submitTransaction,
} from './utils';

export interface Status {
  confirmed: boolean;
  block_height?: number;
  block_hash?: string;
  block_time?: number;
}

export interface EsploraUtxo {
  txid: string;
  vout: number;
  status: Status;
  value: number;
}

export interface BitcoinUtxo {
  txId: string;
  index: number;
  value: bigint;
}

export interface EsploraAddress {
  address: string;
  chain_stats: Stats;
  mempool_stats: Stats;
}

export interface Stats {
  funded_txo_count: number;
  funded_txo_sum: number;
  spent_txo_count: number;
  spent_txo_sum: number;
  tx_count: number;
}

// from @scure/btc-signer package
enum SignatureHash {
  DEFAULT,
  ALL,
  NONE,
  SINGLE,
  ANYONECANPAY = 0x80,
}

export enum SigHash {
  DEFAULT = SignatureHash.DEFAULT,
  ALL = SignatureHash.ALL,
  NONE = SignatureHash.NONE,
  SINGLE = SignatureHash.SINGLE,
  DEFAULT_ANYONECANPAY = SignatureHash.DEFAULT | SignatureHash.ANYONECANPAY,
  ALL_ANYONECANPAY = SignatureHash.ALL | SignatureHash.ANYONECANPAY,
  NONE_ANYONECANPAY = SignatureHash.NONE | SignatureHash.ANYONECANPAY,
  SINGLE_ANYONECANPAY = SignatureHash.SINGLE | SignatureHash.ANYONECANPAY,
}

export interface UnsignedPsbtData {
  psbt: string;
  inputSize: number;
}

export type WalletCreator = (config: WalletCreatorConfig) => Wallet;

export type WalletCreatorConfig = {
  getTokenMap(): Promise<TokenMap>;
  generateOpReturnData: typeof generateOpReturnData;
  generateUnsignedTx: ReturnType<typeof generateUnsignedTx>;
  submitTransaction: typeof submitTransaction;
  getAddressBalance: typeof getAddressBalance;
};
