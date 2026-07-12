import type {
  BitcoinEsploraScanner,
  BitcoinRpcScanner,
  DogeRpcScanner,
} from '@rosen-bridge/bitcoin-scanner';
import type {
  CardanoBlockFrostScanner,
  CardanoKoiosScanner,
  CardanoOgmiosScanner,
} from '@rosen-bridge/cardano-scanner';
import type { ErgoScanner } from '@rosen-bridge/ergo-scanner';
import type { EvmRpcScanner } from '@rosen-bridge/evm-scanner';

export type ChainScannersType =
  | ErgoScanner
  | CardanoKoiosScanner
  | BitcoinRpcScanner
  | DogeRpcScanner
  | EvmRpcScanner
  | CardanoBlockFrostScanner
  | CardanoOgmiosScanner
  | BitcoinEsploraScanner;
