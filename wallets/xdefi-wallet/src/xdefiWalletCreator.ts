import { WalletCreator } from '@rosen-network/bitcoin';

import { getAddressCreator } from './getAddressCreator';
import { getBalanceCreator } from './getBalance';
import { getXdefiWallet } from './getXdefiWallet';
import { isXdefiAvailable } from './isXdefiAvailable';
import { transferCreator } from './transfer';

export const xdefiWalletCreator: WalletCreator = (config) => {
  return Object.assign({}, getXdefiWallet(), {
    isAvailable: isXdefiAvailable,
    getBalance: getBalanceCreator(config),
    transfer: transferCreator(config),
    getAddress: getAddressCreator(),
  });
};
