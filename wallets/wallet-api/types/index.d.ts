import { ConnectorContextApi } from '../src/index';

export interface ConnectorAPI {
  enable(): Promise<ConnectorContextApi>;
  isEnabled(): Promise<boolean>;
  experimental?: unknown;
}

/**
 * global type augmentation for nami wallet
 */
declare global {
  let cardano: { [key: string]: ConnectorAPI };
}
