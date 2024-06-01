import { createRawWallet } from '@rosen-ui/wallet-api';
import { getAddress, signTransaction } from 'sats-connect';

import { connectWallet } from './connectWallet';
import { xdefiWalletInfo } from './xdefiWalletInfo';

/**
 * Xdefi implementation of the Wallet
 * interface to be able to interact with Xdefi wallet
 */
export const getXdefiWallet = () => {
  return createRawWallet(
    {
      ...xdefiWalletInfo,
      connectWallet,
    },
    {
      getAddress,
      signTransaction,
    }
  );
};
