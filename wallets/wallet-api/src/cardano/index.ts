import { ReactNode } from 'react';
import type { RosenChainToken } from '@rosen-bridge/tokens';

import {
  Address,
  PolicyId,
  Prover,
  Value,
  HexString,
  RawTx,
  TxOut,
  Wallet,
} from '../types';

/**
 * cardano token info
 */
export interface CradanoToken extends RosenChainToken {
  fingerprint: string;
  policyId: PolicyId;
  assetName: HexString;
  decimals: number;
}

/**
 * main interface the connect and control ergo wallets
 */
export interface CardanoWallet extends Wallet, Prover {
  readonly testnetSwitchGuideUrl?: string;
  readonly getBalance: (token: RosenChainToken) => Promise<ReactNode>;
  readonly getUsedAddresses?: () => Address[];
  readonly getChangeAddress?: () => Address;
  readonly getAddresses?: () => Address[];
  readonly getUnusedAddresses?: () => Address[];
  readonly getUtxos?: (amount?: Value) => TxOut[];
  readonly getCollateral?: (amount: bigint) => TxOut[];
  readonly submit?: (tx: RawTx) => HexString;
}

export * from './assetEntry';
export * from './serlib';
export * from './cardanoWasmLoader';
