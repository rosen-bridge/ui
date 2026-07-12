import type { Network } from '@rosen-ui/types';

import type { BinanceEvmRpcDataAdapter } from './binanceEvmRpcDataAdapter';
import type { BitcoinEsploraDataAdapter } from './bitcoinEsploraDataAdapter';
import type { BitcoinRunesDataAdapter } from './bitcoinRunsDataAdapter';
import type { CardanoKoiosDataAdapter } from './cardanoKoiosDataAdapter';
import type { DogeBlockCypherDataAdapter } from './dogeBlockCypherDataAdapter';
import type { ErgoExplorerDataAdapter } from './ergoExplorerDataAdapter';
import type { EthereumEvmRpcDataAdapter } from './ethereumEvmRpcDataAdapter';

export type AssetBalance = { [assetId: string]: AddressBalance[] };

export type EVMChainsType = Extract<Network, 'ethereum' | 'binance'>;

export type FetchOffsetType = { [key: string]: number };

export interface TotalSupply {
  assetId: string;
  totalSupply: bigint;
}

export interface AddressBalance {
  address: string;
  balance: bigint;
}

export interface ChainAssetBalance {
  assetId: string;
  balance: bigint;
}

export type ChainsAdapters =
  | ErgoExplorerDataAdapter
  | BitcoinEsploraDataAdapter
  | EthereumEvmRpcDataAdapter
  | BinanceEvmRpcDataAdapter
  | BitcoinRunesDataAdapter
  | CardanoKoiosDataAdapter
  | DogeBlockCypherDataAdapter;

export interface ErgoExplorerDataAdapterAuthParams {
  explorerUrl: string;
}

export interface BitcoinEsploraDataAdapterAuthParams {
  url: string | undefined;
}

export interface CardanoKoiosDataAdapterAuthParams {
  koiosUrl: string | undefined;
  authToken: string | undefined;
}

export interface DogeBlockCypherDataAdapterAuthParams {
  blockCypherUrl: string;
}

export interface EvmRpcDataAdapterAuthParams {
  url: string;
  authToken: string | undefined;
}

export type UnisatResponse<T> = {
  code: number;
  msg: string;
  data: T | null;
};

export type AddressRunesBalance = {
  amount: string;
  runeId: string;
  rune: string;
  spacedRune: string;
  symbol: string;
  divisibility: number;
};

export type RuneInfo = {
  runeid: string;
  rune: string;
  spacedRune: string;
  number: number;
  height: number;
  txidx: number;
  timestamp: number;
  divisibility: number;
  symbol: string;
  etching: string;
  premine: string;
  terms: RuneInfoTerms;
  mints: string;
  burned: string;
  holders: number;
  transactions: number;
  supply: string;
  start: number;
  end: number;
  mintable: boolean;
  remaining: string;
};

type RuneInfoTerms = {
  amount: string;
  cap: string;
  heightStart: number;
  heightEnd: number;
  offsetStart: number | null;
  offsetEnd: number | null;
};
