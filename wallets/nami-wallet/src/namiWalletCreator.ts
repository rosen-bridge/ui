import { WalletCreator } from '@rosen-network/cardano';

import { getBalanceCreator } from './getBalance';
import { getNamiWallet } from './getNamiWallet';
import { isNamiAvailable } from './isNamiAvailable';
import { transferCreator } from './transfer';
import { getAssets } from './getAssets';

export const namiWalletCreator: WalletCreator = (config) => {
  return Object.assign({}, getNamiWallet(), {
    isAvailable: isNamiAvailable,
    getBalance: getBalanceCreator(config),
    transfer: transferCreator(config),
    getAssets: getAssets(config),
    getAddress: async () => {
      throw new Error('Not implemented');
    },
  });
};
