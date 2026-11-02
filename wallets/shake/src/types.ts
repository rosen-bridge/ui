import type { WalletConfig } from '@rosen-ui/wallet-api';

export type ShakeWalletConfig = WalletConfig;

export interface ShakeWalletClient {
  getAddress(): Promise<string>;
  getBalance(): Promise<{
    confirmed: number;
    unconfirmed: number;
  }>;
  sendRosenBridgeData(opts: {
    receiver: string;
    amount: number;
    data: string;
  }): Promise<{ hash: string }>;
}

/**
 * global type augmentation for the wallet
 */
declare global {
  interface Window {
    shake?: {
      connect(): Promise<ShakeWalletClient>;
      isLocked(): Promise<boolean>;
    };
  }
}
