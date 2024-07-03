import { EipWalletApi } from '@rosen-ui/wallet-api';

/**
 * global type augmentation for nautilus wallet
 */
declare global {
  let ergoConnector: {
    nautilus: {
      connect: (params: { createErgoObject: boolean }) => Promise<boolean>;
      getContext: () => Promise<EipWalletApi>;
    };
  };
}

export {};
