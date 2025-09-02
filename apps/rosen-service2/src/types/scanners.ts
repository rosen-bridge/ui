import { BitcoinEsploraScanner } from '@rosen-bridge/bitcoin-esplora-scanner';
import {
  BitcoinRpcScanner,
  DogeRpcScanner,
} from '@rosen-bridge/bitcoin-rpc-scanner';
import { EvmRpcScanner } from '@rosen-bridge/evm-rpc-scanner';
import {
  CardanoBlockFrostScanner,
  CardanoKoiosScanner,
  CardanoOgmiosScanner,
  ErgoScanner,
} from '@rosen-bridge/scanner';

export type ChainScannersType =
  | ErgoScanner
  | CardanoKoiosScanner
  | BitcoinRpcScanner
  | DogeRpcScanner
  | EvmRpcScanner
  | CardanoBlockFrostScanner
  | CardanoOgmiosScanner
  | BitcoinEsploraScanner;
