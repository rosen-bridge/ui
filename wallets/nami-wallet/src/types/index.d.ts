import { ConnectorContextApi } from '@rosen-ui/wallet-api';

export interface ConnectorAPI {
  enable(): Promise<ConnectorContextApi>;
  isEnabled(): Promise<boolean>;
  experimental?: any;
}

/**
 * global type augmentation for nami wallet
 */
declare global {
  declare let cardano: { [key: string]: ConnectorAPI };
}
