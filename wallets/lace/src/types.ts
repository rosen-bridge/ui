import { CipWalletApi, WalletConfig } from '@rosen-ui/wallet-api';

export type LaceWalletConfig = WalletConfig & {};

/**
 * global type augmentation for the wallet
 */
declare global {
  interface Window {
    cardano: {
      lace: {
        enable: () => Promise<CipWalletApi>;
        isEnabled: () => Promise<boolean>;
        experimental?: unknown;
      };
    };
  }
}
