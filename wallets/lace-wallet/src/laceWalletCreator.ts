import { Wallet } from '@rosen-ui/wallet-api';

import { getBalanceCreator } from './getBalance';
import { getLaceWallet } from './getLaceWallet';
import { isLaceAvailable } from './isLaceAvailable';
import { transferCreator } from './transfer';
import { LaceWalletCreator } from './types';

export const laceWalletCreator = (
  config: LaceWalletCreator
): Wallet | undefined => {
  if (!isLaceAvailable()) return;
  return Object.assign({}, getLaceWallet(), {
    getBalance: getBalanceCreator(config),
    transfer: transferCreator(config),
  });
};
