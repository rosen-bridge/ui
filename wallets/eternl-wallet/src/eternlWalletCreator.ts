import { WalletCreator } from '@rosen-network/cardano';

import { getBalanceCreator } from './getBalance';
import { getEternlWallet } from './getEternlWallet';
import { isEternlAvailable } from './isEternlAvailable';
import { transferCreator } from './transfer';
import { getAssets } from './getAssets';

export const eternlWalletCreator: WalletCreator = (config) => {
  return Object.assign({}, getEternlWallet(), {
    isAvailable: isEternlAvailable,
    getBalance: getBalanceCreator(config),
    transfer: transferCreator(config),
    getAssets: getAssets(config),
    getAddress: async () => {
      throw new Error('Not implemented');
    },
  });
};
