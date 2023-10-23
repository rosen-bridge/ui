import type { RosenChainToken } from '@rosen-bridge/tokens';

import {
  Address,
  HexString,
  RawTx,
  TxOut,
  Wallet,
  RawTxOut,
  RawValue,
} from '../types';

import { RawUnsignedTx } from '../bridges';

/**
 * this interface represents the wallet api without
 * any wasm decoding
 */
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
  readonly createTransaction: (
    token: RosenChainToken,
    toChain: string,
    address: Address,
    bridgeFee: number,
    networkFee: number,
    lockAddress: string
  ) => void;
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
  readonly createTransaction: (
    token: RosenChainToken,
    toChain: string,
    address: Address,
    bridgeFee: number,
    networkFee: number,
    lockAddress: string
  ) => void;
}

export * from './address';
export * from './assetEntry';
export * from './serlib';
export * from './createCardanoWallet';
