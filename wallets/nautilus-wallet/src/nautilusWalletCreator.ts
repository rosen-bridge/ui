import { WalletCreator } from '@rosen-network/ergo';

import { getBalanceCreator } from './getBalance';
import { getNautilusWallet } from './getNautilusWallet';
import { isNautilusAvailable } from './isNautilusAvailable';
import { transferCreator } from './transfer';

export const nautilusWalletCreator: WalletCreator = (config) => {
  return Object.assign({}, getNautilusWallet(), {
    isAvailable: isNautilusAvailable,
    getBalance: getBalanceCreator(config),
    transfer: transferCreator(config),
    getAddress: async () => {
      throw new Error('Not implemented');
    },
  });
};
