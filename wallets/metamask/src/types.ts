import { TokenMap } from '@rosen-bridge/tokens';
import type {
  generateTxParameters,
  generateLockData,
} from '@rosen-network/ethereum';

export type WalletConfig = {
  getTokenMap(): Promise<TokenMap>;
  generateLockData: typeof generateLockData;
  generateTxParameters: ReturnType<typeof generateTxParameters>;
};