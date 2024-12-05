import { createRawWallet } from '@rosen-ui/wallet-api';

import { connectWallet } from './connectWallet';
import { okxWalletInfo } from './okxWalletInfo';

/**
 * OKX implementation of the Wallet
 * interface to be able to interact with OKX wallet
 */
export const getOKXWallet = () => {
  return createRawWallet(
    {
      ...okxWalletInfo,
      connectWallet,
    },
    () => {},
  );
};
