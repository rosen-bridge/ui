import { Wallet } from '@rosen-ui/wallet-api';

import { getBalanceCreator } from './getBalance';
import { getEternlWallet } from './getEternlWallet';
import { isEternlAvailable } from './isEternlAvailable';
import { transferCreator } from './transfer';
import { EternlWalletCreator } from './types';

export const eternlWalletCreator = (
  config: EternlWalletCreator
): Wallet | undefined => {
  if (!isEternlAvailable()) return;
  return Object.assign({}, getEternlWallet(), {
    getBalance: getBalanceCreator(config),
    transfer: transferCreator(config),
    getAddress: async () => {
      throw new Error('Not implemented');
    },
  });
};
