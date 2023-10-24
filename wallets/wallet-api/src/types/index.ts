import { ReactNode, FC } from 'react';

export enum WalletState {
  NOT_CONNECTED,
  CONNECTING,
  CONNECTED,
}

/**
 * main wallet type for the bridge, all wallets implement
 * this interface to unify access and interaction with wallets
 */
export interface WalletBase {
  icon: FC;
  name: string;
  label: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  connectWallet: () => Promise<boolean | ReactNode>;
  hidden?: boolean;
}

export interface RawWallet<Api> extends WalletBase {
  api: Api;
}

export * from './common';
export * from './ergo';
export * from './cardano';
export * from './cip-wallet-api';
