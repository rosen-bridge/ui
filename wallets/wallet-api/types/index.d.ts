import { CipWalletApi } from '../src/index';

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
