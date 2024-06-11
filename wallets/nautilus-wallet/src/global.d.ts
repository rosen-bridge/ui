import { EipWalletApi } from '@rosen-ui/wallet-api';

/**
 * global type augmentation for nautilus wallet
 */
declare global {
  declare let ergoConnector: {
    nautilus: {
      connect: (params: { createErgoObject: boolean }) => Promise<boolean>;
      getContext: () => Promise<EipWalletApi>;
    };
  };

  declare let ergo: EipWalletApi;
}
