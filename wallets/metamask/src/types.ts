import type { MetaMaskInpageProvider } from '@metamask/providers';
import type { WalletConfig } from '@rosen-ui/wallet-api';

export type MetaMaskWalletConfig = WalletConfig & {};

/**
 * global type augmentation for the wallet
 */
declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider;
  }
}
