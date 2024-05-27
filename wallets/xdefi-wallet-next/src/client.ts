import { Wallet } from '@rosen-ui/wallet-api';

import { getXdefiWallet } from './getXdefiWallet';
import { type getBalance } from './getBalance';
import { type transfer } from './transfer';

export type XdefiWalletCreator = {
  getBalance: typeof getBalance;
  transfer: typeof transfer;
};

export const xdefiWalletCreator = (config: XdefiWalletCreator): Wallet => {
  return Object.assign({}, getXdefiWallet(), config);
};
