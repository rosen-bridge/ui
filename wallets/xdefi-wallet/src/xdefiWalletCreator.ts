import { WalletCreator } from '@rosen-network/bitcoin';

import { getBalanceCreator } from './getBalance';
import { getXdefiWallet } from './getXdefiWallet';
import { isXdefiAvailable } from './isXdefiAvailable';
import { transferCreator } from './transfer';
import { getAddressCreator } from './getAddressCreator';

export const xdefiWalletCreator: WalletCreator = (config) => {
  if (!isXdefiAvailable()) return;
  return Object.assign({}, getXdefiWallet(), {
    getBalance: getBalanceCreator(config),
    transfer: transferCreator(config),
    getAddress: getAddressCreator(config),
  });
};
