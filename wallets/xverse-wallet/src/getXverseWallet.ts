import { createRawWallet } from '@rosen-ui/wallet-api';
import { getAddress, signTransaction } from 'sats-connect';

import { connectWallet } from './connectWallet';
import { xverseWalletInfo } from './xverseWalletInfo';

/**
 * Xverse implementation of the Wallet
 * interface to be able to interact with Xverse wallet
 */
export const getXverseWallet = () => {
  return createRawWallet(
    {
      ...xverseWalletInfo,
      connectWallet,
    },
    {
      getAddress,
      signTransaction,
    }
  );
};
