import { Zcash as ZcashIcon } from '@rosen-bridge/icons';
import type { Network, NetworkMaxTransferParams } from '@rosen-network/base';
import { NETWORKS } from '@rosen-ui/constants';

import { unwrapFromObject } from '@/safeServerAction';

import { LOCK_ADDRESSES } from '../../../configs';
import * as actions from './server';

export type ZcashNetworkName = 'mainnet' | 'testnet' | 'regtest';

// The three-output Zallet PCZT needs 20,000 zat plus one zat of non-zero change.
// Additional inputs can cost more; the local companion remains decisive.
const ZALLET_FEE_MARGIN_ZAT = 20_001n;

const hasZalletCompanionUrl = () => {
  const value = process.env.NEXT_PUBLIC_ZALLET_COMPANION_URL;
  if (!value) return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === 'http:' &&
      url.hostname === '127.0.0.1' &&
      !url.username &&
      !url.password &&
      url.pathname === '/' &&
      !url.search &&
      !url.hash
    );
  } catch {
    return false;
  }
};

export class ZcashNetwork implements Network {
  readonly label = NETWORKS.zcash.label;
  readonly name = NETWORKS.zcash.key;
  readonly logo = ZcashIcon;
  readonly nextHeightInterval = 1;
  readonly lockAddress = LOCK_ADDRESSES.zcash;
  readonly network = process.env.NEXT_PUBLIC_ZCASH_NETWORK as ZcashNetworkName | undefined;
  readonly genesisHash = process.env.NEXT_PUBLIC_ZCASH_GENESIS_HASH;

  private readonly actions = unwrapFromObject(actions);

  isConfigured = (): boolean =>
    ['mainnet', 'testnet', 'regtest'].includes(this.network ?? '') &&
    /^[0-9a-f]{64}$/.test(this.genesisHash ?? '') &&
    /^t[1-9A-HJ-NP-Za-km-z]{30,}$/.test(this.lockAddress ?? '');

  isDepositAvailable = (): boolean => this.isConfigured() && hasZalletCompanionUrl();

  calculateFee = (...args: Parameters<Network['calculateFee']>) =>
    this.actions.calculateFee(...args);
  getMinTransfer = (...args: Parameters<Network['getMinTransfer']>) =>
    this.actions.getMinTransfer(...args);
  validateAddress = (address: string) => this.actions.validateAddress(this.name, address);
  generateOpReturnData = (...args: Parameters<typeof actions.generateOpReturnData>) =>
    this.actions.generateOpReturnData(...args);
  getMaxTransfer = async ({ balance }: NetworkMaxTransferParams) =>
    balance > ZALLET_FEE_MARGIN_ZAT ? balance - ZALLET_FEE_MARGIN_ZAT : 0n;
  toSafeAddress = (address: string) => address;
}

export const zcash = new ZcashNetwork();
