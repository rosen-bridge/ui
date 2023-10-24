import { CipWalletApi } from '../../types';

/**
 * search the wallet and return the balance for
 * the requested token
 */

export const getBalance = async (context: CipWalletApi) => {
  const rawValue = await context.getBalance();
  return rawValue;
};
