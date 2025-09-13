import {
  BitcoinRpcScanner,
  DogeRpcScanner,
  BitcoinEsploraScanner,
} from '@rosen-bridge/bitcoin-scanner';
import {
  CardanoBlockFrostScanner,
  CardanoKoiosScanner,
  CardanoOgmiosScanner,
} from '@rosen-bridge/cardano-scanner';
import { EvmRpcScanner } from '@rosen-bridge/evm-scanner';

export type ExtraChainScannersType =
  | CardanoKoiosScanner
  | BitcoinRpcScanner
  | DogeRpcScanner
  | EvmRpcScanner
  | CardanoBlockFrostScanner
  | CardanoOgmiosScanner
  | BitcoinEsploraScanner;
