import { BinanceEvmRpcDataAdapter } from './binanceEvmRpcDataAdapter';
import { BitcoinEsploraDataAdapter } from './bitcoinEsploraDataAdapter';
import { CardanoKoiosDataAdapter } from './cardanoKoiosDataAdapter';
import { DogeBlockCypherDataAdapter } from './dogeBlockCypherDataAdapter';
import { ErgoExplorerDataAdapter } from './ergoExplorerDataAdapter';
import { EthereumEvmRpcDataAdapter } from './ethereumEvmRpcDataAdapter';

export type AssetBalance = { [assetId: string]: AddressBalance[] };

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
