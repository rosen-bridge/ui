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
import { ErgoScanner } from '@rosen-bridge/ergo-scanner';
import { EvmRpcScanner } from '@rosen-bridge/evm-scanner';

export type ChainScannersType =
  | ErgoScanner
  | CardanoKoiosScanner
  | BitcoinRpcScanner
  | DogeRpcScanner
  | EvmRpcScanner
  | CardanoBlockFrostScanner
  | CardanoOgmiosScanner
  | BitcoinEsploraScanner;
