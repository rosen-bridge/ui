import type {
  generateTxParameters,
  generateLockData,
} from '@rosen-network/evm';

import { WalletConnectConfig } from '../abstract/types';

export type WalletConnectEVMConfig = WalletConnectConfig & {
  generateLockData: typeof generateLockData;
  generateTxParameters: ReturnType<typeof generateTxParameters>;
};
