import { WalletCreator } from '@rosen-network/bitcoin';

import { getBalanceCreator } from './getBalance';
import { getXdefiWallet } from './getXdefiWallet';
import { isXdefiAvailable } from './isXdefiAvailable';
import { transferCreator } from './transfer';
import { getAddressCreator } from './getAddressCreator';
import { getAssets } from './getAssets';

export const xdefiWalletCreator: WalletCreator = (config) => {
  return Object.assign({}, getXdefiWallet(), {
    isAvailable: isXdefiAvailable,
    getBalance: getBalanceCreator(config),
    transfer: transferCreator(config),
    getAssets: getAssets(config),
    getAddress: getAddressCreator(config),
  });
};
