import { createRawWallet } from '@rosen-ui/wallet-api';
import { getAddress, signTransaction } from 'sats-connect';

import { connectWallet } from './connectWallet';
import { xdefiWalletInfo } from './xdefiWalletInfo';

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
