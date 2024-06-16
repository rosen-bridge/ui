import { WalletCreator } from '@rosen-network/cardano';

import { getBalanceCreator } from './getBalance';
import { getLaceWallet } from './getLaceWallet';
import { isLaceAvailable } from './isLaceAvailable';
import { transferCreator } from './transfer';

export const laceWalletCreator: WalletCreator = (config) => {
  if (!isLaceAvailable()) return;
  return Object.assign({}, getLaceWallet(), {
    getBalance: getBalanceCreator(config),
    transfer: transferCreator(config),
    getAddress: async () => {
      throw new Error('Not implemented');
    },
  });
};
