import type { RosenChainToken } from '@rosen-bridge/tokens';

import { Address, TxOut, WalletBase } from '../types';

/**
 * main interface the connect and control ergo wallets
 */
export interface CardanoWallet extends WalletBase {
  readonly getBalance: (token: RosenChainToken) => Promise<number>;
  readonly getChangeAddress: () => Promise<Address>;
  readonly getUtxos: () => Promise<TxOut[]>;
  readonly transfer: (
    token: RosenChainToken,
    toChain: string,
    address: Address,
    bridgeFee: number,
    networkFee: number,
    lockAddress: string
  ) => Promise<string>;
}

export * from './address';
export * from './assetEntry';
export * from './createRawCardanoWallet';
export * from './serlib';
