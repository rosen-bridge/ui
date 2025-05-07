import type {
  generateTxParameters,
  generateLockData,
} from '@rosen-network/evm';
import { WalletConfig } from '@rosen-ui/wallet-api';

export type MetaMaskWalletConfig = WalletConfig & {
  generateLockData: typeof generateLockData;
  generateTxParameters: ReturnType<typeof generateTxParameters>;
};
