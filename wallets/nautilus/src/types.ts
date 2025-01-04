import { TokenMap } from '@rosen-bridge/tokens';
import type { generateUnsignedTx } from '@rosen-network/ergo';
import { EipWalletApi } from '@rosen-ui/wallet-api';

export type WalletConfig = {
  getTokenMap(): Promise<TokenMap>;
  generateUnsignedTx: ReturnType<typeof generateUnsignedTx>;
};

/**
 * global type augmentation for nautilus wallet
 */
declare global {
  interface Window {
    ergoConnector: {
      nautilus: {
        connect: (params: { createErgoObject: boolean }) => Promise<boolean>;
        getContext: () => Promise<EipWalletApi>;
        isAuthorized: () => Promise<boolean>;
      };
    };
  }
}
