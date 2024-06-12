import { Wallet } from '@rosen-ui/wallet-api';

import { getBalanceCreator } from './getBalance';
import { getXdefiWallet } from './getXdefiWallet';
import { isXdefiAvailable } from './isXdefiAvailable';
import { transferCreator } from './transfer';
import { XdefiWalletCreator } from './types';
import { getAddressCreator } from './getAddressCreator';

export const xdefiWalletCreator = (
  config: XdefiWalletCreator
): Wallet | undefined => {
  if (!isXdefiAvailable()) return;
  return Object.assign({}, getXdefiWallet(), {
    getBalance: getBalanceCreator(config),
    transfer: transferCreator(config),
    getAddress: getAddressCreator(config),
  });
};
