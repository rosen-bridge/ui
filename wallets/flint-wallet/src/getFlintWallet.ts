import { createRawWallet } from '@rosen-ui/wallet-api';

import { connectWallet } from './connectWallet';
import { flintWalletInfo } from './flintWalletInfo';

/**
 * Flint implementation of the Wallet
 * interface to be able to interact with Flint wallet
 */
export const getFlintWallet = () =>
  createRawWallet(
    {
      ...flintWalletInfo,
      connectWallet,
    },
    () => window.cardano.flint,
  );
