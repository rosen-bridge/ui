import { CipWalletApi } from '@rosen-ui/wallet-api';

/**
 * global type augmentation for the wallet
 */
declare global {
  interface Window {
    cardano: {
      nami: {
        enable(): Promise<CipWalletApi>;
        isEnabled(): Promise<boolean>;
        experimental?: unknown;
      };
    };
  }
}

export {};
