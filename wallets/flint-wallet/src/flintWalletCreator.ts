import { Wallet } from '@rosen-ui/wallet-api';

import { getBalanceCreator } from './getBalance';
import { getFlintWallet } from './getFlintWallet';
import { isFlintAvailable } from './isFlintAvailable';
import { transferCreator } from './transfer';
import { FlintWalletCreator } from './types';

export const flintWalletCreator = (
  config: FlintWalletCreator
): Wallet | undefined => {
  if (!isFlintAvailable()) return;
  return Object.assign({}, getFlintWallet(), {
    getBalance: getBalanceCreator(config),
    transfer: transferCreator(config),
    getAddress: async () => {
      throw new Error('Not implemented');
    },
  });
};
