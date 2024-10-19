import { WalletCreator } from '@rosen-network/cardano';

import { getBalanceCreator } from './getBalance';
import { getFlintWallet } from './getFlintWallet';
import { isFlintAvailable } from './isFlintAvailable';
import { transferCreator } from './transfer';
import { getAssets } from './getAssets';

export const flintWalletCreator: WalletCreator = (config) => {
  return Object.assign({}, getFlintWallet(), {
    isAvailable: isFlintAvailable,
    getBalance: getBalanceCreator(config),
    transfer: transferCreator(config),
    getAssets: getAssets(config),
    getAddress: async () => {
      throw new Error('Not implemented');
    },
  });
};
