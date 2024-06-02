import { Wallet } from '@rosen-ui/wallet-api';

import { getBalanceCreator } from './getBalance';
import { getXdefiWallet } from './getXdefiWallet';
import { transferCreator } from './transfer';
import { XdefiWalletCreator } from './types';

export const xdefiWalletCreator = (config: XdefiWalletCreator): Wallet => {
  return Object.assign({}, getXdefiWallet(), {
    getBalance: getBalanceCreator(config),
    transfer: transferCreator(config),
  });
};
