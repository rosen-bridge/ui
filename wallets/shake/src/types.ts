import { WalletConfig } from '@rosen-ui/wallet-api';

export type ShakeWalletConfig = WalletConfig;

export interface ShakeWallet {
  getAddress(): Promise<string>;
  getBalance(): Promise<{
    confirmed: number;
    unconfirmed: number;
    total: number;
  }>;
  sendRosenBridgeData(opts: {
    receiver: string;
    amount: number;
    data: string;
  }): Promise<{ hash: string }>;
}

export interface ShakeAPI {
  connect(): Promise<ShakeWallet>;
  isLocked(): Promise<boolean>;
}

declare global {
  interface Window {
    shake?: ShakeAPI;
  }
}
