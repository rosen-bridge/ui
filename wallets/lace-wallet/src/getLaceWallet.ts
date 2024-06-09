import { createRawWallet } from '@rosen-ui/wallet-api';
import { connectWallet } from './connectWallet';

import { laceWalletInfo } from './laceWalletInfo';

/**
 * Lace implementation of the Wallet
 * interface to be able to interact with Lace wallet
 */
export const getLaceWallet = () =>
  createRawWallet(
    {
      ...laceWalletInfo,
      connectWallet,
    },
    cardano.lace
  );
