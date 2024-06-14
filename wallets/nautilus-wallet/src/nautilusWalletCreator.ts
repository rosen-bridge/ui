import { Wallet } from '@rosen-ui/wallet-api';

import { getBalanceCreator } from './getBalance';
import { getNautilusWallet } from './getNautilusWallet';
import { isNautilusAvailable } from './isNautilusAvailable';
import { transferCreator } from './transfer';
import { NautilusWalletCreator } from './types';

export const nautilusWalletCreator = (
  config: NautilusWalletCreator
): Wallet | undefined => {
  if (!isNautilusAvailable()) return;
  return Object.assign({}, getNautilusWallet(), {
    getBalance: getBalanceCreator(config),
    transfer: transferCreator(config),
    getAddress: async () => {
      throw new Error('Not implemented');
    },
  });
};
