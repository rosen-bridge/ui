import { WalletCreator } from '@rosen-network/cardano';

import { getBalanceCreator } from './getBalance';
import { getLaceWallet } from './getLaceWallet';
import { isLaceAvailable } from './isLaceAvailable';
import { transferCreator } from './transfer';
import { getAssets } from './getAssets';

export const laceWalletCreator: WalletCreator = (config) => {
  return Object.assign({}, getLaceWallet(), {
    isAvailable: isLaceAvailable,
    getBalance: getBalanceCreator(config),
    transfer: transferCreator(config),
    getAssets: getAssets(config),
    getAddress: async () => {
      throw new Error('Not implemented');
    },
  });
};
