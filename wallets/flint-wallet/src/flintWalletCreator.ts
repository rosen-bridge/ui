import { WalletCreator } from '@rosen-network/cardano';

import { getBalanceCreator } from './getBalance';
import { getFlintWallet } from './getFlintWallet';
import { isFlintAvailable } from './isFlintAvailable';
import { transferCreator } from './transfer';

export const flintWalletCreator: WalletCreator = (config) => {
  if (!isFlintAvailable()) return;
  return Object.assign({}, getFlintWallet(), {
    getBalance: getBalanceCreator(config),
    transfer: transferCreator(config),
  });
};
