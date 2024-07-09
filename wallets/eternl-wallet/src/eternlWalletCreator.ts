import { WalletCreator } from '@rosen-network/cardano';

import { getBalanceCreator } from './getBalance';
import { getEternlWallet } from './getEternlWallet';
import { isEternlAvailable } from './isEternlAvailable';
import { transferCreator } from './transfer';

export const eternlWalletCreator: WalletCreator = (config) => {
  return Object.assign({}, getEternlWallet(), {
    isAvailable: isEternlAvailable,
    getBalance: getBalanceCreator(config),
    transfer: transferCreator(config),
    getAddress: async () => {
      throw new Error('Not implemented');
    },
  });
};
