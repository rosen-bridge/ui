import { MetaMaskSDK } from '@metamask/sdk';
import { createRawWallet } from '@rosen-ui/wallet-api';

import { connectWallet } from './connectWallet';
import { metaMaskWalletInfo } from './metaMaskWalletInfo';

export const metaMaskSDK = new MetaMaskSDK({
  dappMetadata: {
    name: 'Rosen Bridge',
  },
  enableAnalytics: false,
});

/**
 * MetaMask implementation of the Wallet
 * interface to be able to interact with MetaMask wallet
 */
export const getMetaMaskWallet = () => {
  return createRawWallet(
    {
      ...metaMaskWalletInfo,
      connectWallet,
    },
    () => metaMaskSDK
  );
};
