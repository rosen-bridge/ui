import { TokenMap } from '@rosen-bridge/tokens';
import { Wallet } from '@rosen-ui/wallet-api';

import { generateTxParameters } from './generateTxParameters';
import { generateLockData } from './utils';

export type WalletCreator = (config: WalletCreatorConfig) => Wallet;

export type WalletCreatorConfig = {
  getTokenMap(): Promise<TokenMap>;
  generateLockData: typeof generateLockData;
  generateTxParameters: ReturnType<typeof generateTxParameters>;
};
