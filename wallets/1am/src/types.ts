import type { CipWalletApi } from '@rosen-network/cardano';
import type { WalletConfig } from '@rosen-ui/wallet-api';

export type OneAmWalletConfig = WalletConfig & {};

/**
 * global type augmentation for the wallet
 */
declare global {
  interface Window {
    cardano: {
      '1am': {
        enable: () => Promise<CipWalletApi>;
        isEnabled: () => Promise<boolean>;
        experimental?: unknown;
      };
    };
  }
}
