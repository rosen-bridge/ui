import { Wallet } from '@rosen-ui/wallet-api';

import { getBalanceCreator } from './getBalance';
import { getNamiWallet } from './getNamiWallet';
import { isNamiAvailable } from './isNamiAvailable';
import { transferCreator } from './transfer';
import { NamiWalletCreator } from './types';

export const namiWalletCreator = (
  config: NamiWalletCreator
): Wallet | undefined => {
  if (!isNamiAvailable()) return;
  return Object.assign({}, getNamiWallet(), {
    getBalance: getBalanceCreator(config),
    transfer: transferCreator(config),
    getAddress: async () => {
      throw new Error('Not implemented');
    },
  });
};
