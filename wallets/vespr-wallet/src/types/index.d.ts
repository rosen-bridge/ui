import { CipWalletApi } from '@rosen-ui/wallet-api';

export interface ConnectorAPI {
  enable(): Promise<CipWalletApi>;
  isEnabled(): Promise<boolean>;
  experimental?: unknown;
}

/**
 * global type augmentation for Vespr wallet
 */
declare global {
  declare let cardano: { [key: string]: ConnectorAPI };
}
