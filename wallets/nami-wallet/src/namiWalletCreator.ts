import { WalletCreator } from '@rosen-network/cardano';

import { getBalanceCreator } from './getBalance';
import { getNamiWallet } from './getNamiWallet';
import { isNamiAvailable } from './isNamiAvailable';
import { transferCreator } from './transfer';

export const namiWalletCreator: WalletCreator = (config) => {
  return Object.assign({}, getNamiWallet(), {
    isAvailable: isNamiAvailable,
    getBalance: getBalanceCreator(config),
    transfer: transferCreator(config),
    getAddress: async () => {
      throw new Error('Not implemented');
    },
  });
};
