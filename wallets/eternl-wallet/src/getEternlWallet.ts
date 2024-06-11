import { createRawWallet } from '@rosen-ui/wallet-api';

import { connectWallet } from './connectWallet';
import { eternlWalletInfo } from './eternlWalletInfo';

/**
 * Eternl implementation of the Wallet
 * interface to be able to interact with Eternl wallet
 */
export const getEternlWallet = () => {
  return createRawWallet(
    {
      ...eternlWalletInfo,
      connectWallet,
    },
    cardano.eternl
  );
};
