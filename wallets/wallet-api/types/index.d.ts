import { CipWalletApi, EipWalletApi } from '../src/index';

export interface ConnectorAPI {
  enable(): Promise<CipWalletApi>;
  isEnabled(): Promise<boolean>;
  experimental?: unknown;
}

/**
 * global type augmentation for nami wallet
 */
declare global {
  let cardano: { [key: string]: ConnectorAPI };
}

declare global {
  declare let ergoConnector: {
    [key: string]: {
      connect: (params: { createErgoObject: boolean }) => Promise<boolean>;
      getContext: () => Promise<EipWalletApi>;
    };
  };

  declare let ergo: EipWalletApi;
}
