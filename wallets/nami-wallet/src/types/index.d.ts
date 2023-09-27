import { ConnectorContextApi } from '@rosen-ui/wallet-api';

export interface ConnectorAPI {
  enable(): Promise<ConnectorContextApi>;
  isEnabled(): Promise<boolean>;
  experimental?: any;
}

declare global {
  declare let cardano: { [key: string]: ConnectorAPI };
}
