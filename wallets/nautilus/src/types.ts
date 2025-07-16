import type { EipWalletApi } from '@rosen-network/ergo';
import { WalletConfig } from '@rosen-ui/wallet-api';

export type NautilusWalletConfig = WalletConfig & {};

/**
 * global type augmentation for nautilus wallet
 */
declare global {
  interface Window {
    ergoConnector: {
      nautilus: {
        disconnect: () => Promise<boolean>;
        connect: (params: { createErgoObject: boolean }) => Promise<boolean>;
        getContext: () => Promise<EipWalletApi>;
        isAuthorized: () => Promise<boolean>;
      };
    };
  }
}
