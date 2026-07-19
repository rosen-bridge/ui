import type { WalletConfig } from '@rosen-ui/wallet-api';

import type { MetaMaskInpageProvider } from '@metamask/providers';

export type MetaMaskWalletConfig = WalletConfig & {};

/**
 * global type augmentation for the wallet
 */
declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider;
  }
}
