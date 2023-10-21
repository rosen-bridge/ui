import type { RosenChainToken } from '@rosen-bridge/tokens';

import {
  Address,
  PolicyId,
  HexString,
  RawTx,
  TxOut,
  Wallet,
  RawTxOut,
  RawValue,
} from '../types';

import { RawUnsignedTx } from '../bridges';

/**
 * cardano token info
 */
export interface CradanoToken extends RosenChainToken {
  fingerprint: string;
  policyId: PolicyId;
  assetName: HexString;
  decimals: number;
}

export interface CardanoWalletRaw extends Wallet {
  readonly testnetSwitchGuideUrl?: string;
  readonly getBalance: (token: RosenChainToken) => Promise<RawValue>;
  readonly getUtxos: () => Promise<RawTxOut>;
  readonly getChangeAddress: () => Promise<string>;
  readonly sign: (
    tx: RawUnsignedTx,
    partialSign?: boolean
  ) => Promise<HexString>;
  readonly submit: (tx: RawTx) => Promise<HexString>;
  readonly getUsedAddresses?: () => Address[];
  readonly getAddresses?: () => Address[];
  readonly getUnusedAddresses?: () => Address[];
  readonly getCollateral?: (amount: bigint) => TxOut[];
}

/**
 * main interface the connect and control ergo wallets
 */
export interface CardanoWallet extends Wallet {
  readonly testnetSwitchGuideUrl?: string;
  readonly getBalance: (token: RosenChainToken) => Promise<number>;
  readonly getChangeAddress: () => Promise<Address>;
  readonly getUtxos: () => Promise<TxOut[]>;
  readonly submit: (tx: RawTx) => Promise<HexString>;
  readonly sign: (
    tx: RawUnsignedTx,
    partialSign?: boolean
  ) => Promise<HexString>;
  readonly getUsedAddresses?: () => Address[];
  readonly getAddresses?: () => Address[];
  readonly getUnusedAddresses?: () => Address[];
  readonly getCollateral?: (amount: bigint) => TxOut[];
}

export * from './address';
export * from './assetEntry';
export * from './serlib';
export * from './createCardanoWallet';
