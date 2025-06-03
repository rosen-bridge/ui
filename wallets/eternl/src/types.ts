import { CipWalletApi, WalletConfig } from '@rosen-ui/wallet-api';

export type EtrnlWalletConfig = WalletConfig & {};

/**
 * global type augmentation for the wallet
 */
declare global {
  interface Window {
    cardano: {
      eternl: {
        enable: () => Promise<CipWalletApi>;
        isEnabled: () => Promise<boolean>;
        experimental?: unknown;
      };
    };
  }
}
