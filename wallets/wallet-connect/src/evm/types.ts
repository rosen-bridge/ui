import { TokenMap } from '@rosen-bridge/tokens';
import type {
  generateTxParameters,
  generateLockData,
  getBalance,
} from '@rosen-network/evm';

export type WalletConnectEVMConfig = {
  projectId: string;
  getTokenMap(): Promise<TokenMap>;
  generateLockData: typeof generateLockData;
  generateTxParameters: ReturnType<typeof generateTxParameters>;
  getBalance: typeof getBalance;
};
