import { WalletCreator } from '@rosen-network/bitcoin';

import { getBalanceCreator } from './getBalance';
import { getOKXWallet } from './getOKXWallet';
import { isOKXAvailable } from './isOKXAvailable';
import { transferCreator } from './transfer';

export const okxWalletCreator: WalletCreator = (config) => {
  return Object.assign({}, getOKXWallet(), {
    isAvailable: isOKXAvailable,
    getBalance: getBalanceCreator(config),
    transfer: transferCreator(config),
    getAddress: async () => {
      throw new Error('Not implemented');
    },
  });
};
