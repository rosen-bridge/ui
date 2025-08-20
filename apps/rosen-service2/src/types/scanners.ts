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
} from '@rosen-bridge/scanner';

export type ExtraChainScannersType =
  | CardanoKoiosScanner
  | BitcoinRpcScanner
  | DogeRpcScanner
  | EvmRpcScanner
  | CardanoBlockFrostScanner
  | CardanoOgmiosScanner
  | BitcoinEsploraScanner;
