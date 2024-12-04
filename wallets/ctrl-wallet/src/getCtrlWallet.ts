import { createRawWallet } from '@rosen-ui/wallet-api';
import { getAddress, signTransaction } from 'sats-connect';

import { connectWallet } from './connectWallet';
import { ctrlWalletInfo } from './ctrlWalletInfo';

/**
 * Ctrl implementation of the Wallet
 * interface to be able to interact with Ctrl wallet
 */
export const getCtrlWallet = () => {
  return createRawWallet(
    {
      ...ctrlWalletInfo,
      connectWallet,
    },
    () => ({
      getAddress,
      signTransaction,
    }),
  );
};
