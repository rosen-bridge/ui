import { FC } from 'react';

import { RosenChainToken } from '@rosen-bridge/tokens';
import { Network, RosenAmountValue } from '@rosen-ui/types';

/**
 * main wallet type for the bridge, all wallets implement
 * this interface to unify access and interaction with wallets
 */
export interface Wallet {
  icon: FC;
  name: string;
  label: string;
  link: string;
  connect(): Promise<boolean | void>;
  getAddress(): Promise<string>;
  getBalance(token: RosenChainToken): Promise<RosenAmountValue>;
  isAvailable(): boolean;
  switchChain?(chain: Network, silent?: boolean): Promise<void>;
  transfer(params: WalletTransferParams): Promise<string>;
}

export interface WalletTransferParams {
  token: RosenChainToken;
  amount: RosenAmountValue;
  toChain: Network;
  address: string;
  bridgeFee: RosenAmountValue;
  networkFee: RosenAmountValue;
  lockAddress: string;
}

export * from './common';
