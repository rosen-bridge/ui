import { FC } from 'react';

import { RosenChainToken } from '@rosen-bridge/tokens';
import { Network, RosenAmountValue } from '@rosen-ui/types';

import { UnavailableApiError } from './errors';

export interface WalletTransferParams {
  token: RosenChainToken;
  amount: RosenAmountValue;
  toChain: Network;
  address: string;
  bridgeFee: RosenAmountValue;
  networkFee: RosenAmountValue;
  lockAddress: string;
}

/**
 * main wallet type for the bridge, all wallets implement
 * this interface to unify access and interaction with wallets
 */
export abstract class Wallet {
  abstract icon: FC;
  abstract name: string;
  abstract label: string;
  abstract link: string;
  abstract supportedChains: Network[];

  abstract connect: () => Promise<void>;
  abstract disconnect: () => Promise<void>;
  abstract getAddress: () => Promise<string>;
  abstract getBalance: (token: RosenChainToken) => Promise<RosenAmountValue>;
  abstract isAvailable: () => boolean;
  abstract transfer: (params: WalletTransferParams) => Promise<string>;

  isConnected?: () => Promise<boolean>;
  switchChain?: (chain: Network, silent?: boolean) => Promise<void>;

  protected requireAvailable: () => void = () => {
    if (!this.isAvailable()) {
      throw new UnavailableApiError(this.name);
    }
  };
}
