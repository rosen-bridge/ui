import { WalletCreator } from '@rosen-network/ethereum';

import { getBalanceCreator } from './getBalance';
import { getMetaMaskWallet } from './getMetaMaskWallet';
import { isMetaMaskAvailable } from './isMetaMaskAvailable';
import { transferCreator } from './transfer';

export const metaMaskWalletCreator: WalletCreator = (config) => {
  return Object.assign({}, getMetaMaskWallet(), {
    isAvailable: isMetaMaskAvailable,
    getBalance: getBalanceCreator(config),
    transfer: transferCreator(config),
    getAddress: async () => {
      throw new Error('Not implemented');
    },
  });
};
