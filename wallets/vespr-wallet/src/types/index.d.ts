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
  interface Window {
    cardano: { [key: string]: ConnectorAPI };
  }
}
