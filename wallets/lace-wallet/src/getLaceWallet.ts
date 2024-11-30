import { createRawWallet } from '@rosen-ui/wallet-api';

import { connectWallet } from './connectWallet';
import { laceWalletInfo } from './laceWalletInfo';

/**
 * Lace implementation of the Wallet
 * interface to be able to interact with Lace wallet
 */
export const getLaceWallet = () => {
  return createRawWallet(
    {
      ...laceWalletInfo,
      connectWallet,
    },
    () => window.cardano.lace,
  );
};
