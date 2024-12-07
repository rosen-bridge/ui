import { createRawWallet } from '@rosen-ui/wallet-api';

import { connectWallet } from './connectWallet';
import { namiWalletInfo } from './namiWalletInfo';

/**
 * Nami implementation of the Wallet
 * interface to be able to interact with Nami wallet
 */
export const getNamiWallet = () => {
  return createRawWallet(
    {
      ...namiWalletInfo,
      connectWallet,
    },
    () => window.cardano.nami,
  );
};
