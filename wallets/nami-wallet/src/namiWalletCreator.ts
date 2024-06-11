import { WalletCreator } from '@rosen-network/cardano';

import { getBalanceCreator } from './getBalance';
import { getNamiWallet } from './getNamiWallet';
import { isNamiAvailable } from './isNamiAvailable';
import { transferCreator } from './transfer';

export const namiWalletCreator: WalletCreator = (config) => {
  if (!isNamiAvailable()) return;
  return Object.assign({}, getNamiWallet(), {
    getBalance: getBalanceCreator(config),
    transfer: transferCreator(config),
  });
};
