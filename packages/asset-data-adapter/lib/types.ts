import { BinanceEvmRpcDataAdapter } from './binanceEvmRpcDataAdapter';
import { BitcoinEsploraDataAdapter } from './bitcoinEsploraDataAdapter';
import { CardanoKoiosDataAdapter } from './cardanoKoiosDataAdapter';
import { DogeBlockCypherDataAdapter } from './dogeBlockCypherDataAdapter';
import { ErgoExplorerDataAdapter } from './ergoExplorerDataAdapter';
import { EthereumEvmRpcDataAdapter } from './ethereumEvmRpcDataAdapter';

export type AssetBalance = { [assetId: string]: AddressBalance[] };

export type FetchOffsetType = { [key: string]: number };

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
  authToken: string;
}

export interface DogeBlockCypherDataAdapterAuthParams {
  blockCypherUrl: string;
}

export interface EvmRpcDataAdapterAuthParams {
  url: string;
  authToken: string | undefined;
}
