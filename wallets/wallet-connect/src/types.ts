import type { WalletConfig } from '@rosen-ui/wallet-api';

export type WalletConnectConfig = WalletConfig & {
  projectId: string;
};
