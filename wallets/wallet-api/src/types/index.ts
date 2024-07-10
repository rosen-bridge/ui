import { ReactNode, FC } from 'react';
import { RosenChainToken } from '@rosen-bridge/tokens';

export enum WalletState {
  NOT_CONNECTED,
  CONNECTING,
  CONNECTED,
}

export interface WalletInfo {
  icon: FC;
  name: string;
  label: string;
  link: string;
}

/**
 * main wallet type for the bridge, all wallets implement
 * this interface to unify access and interaction with wallets
 */
export interface WalletBase extends WalletInfo {
  onConnect?: () => void;
  onDisconnect?: () => void;
  connectWallet: () => Promise<boolean | ReactNode>;
  hidden?: boolean;
}

export interface Wallet extends WalletBase {
  readonly getBalance: (token: RosenChainToken) => Promise<number>;
  readonly transfer: (
    token: RosenChainToken,
    amount: number,
    toChain: string,
    address: string,
    bridgeFee: number,
    networkFee: number,
    lockAddress: string
  ) => Promise<string>;
  readonly getAddress: () => Promise<string>;
  readonly isAvailable: () => boolean;
}

export interface RawWallet<Api> extends WalletBase {
  api: () => Api;
}

export * from './common';
export * from './ergo';
export * from './cardano';
export * from './cip-wallet-api';
export * from './eip-wallet-api';
