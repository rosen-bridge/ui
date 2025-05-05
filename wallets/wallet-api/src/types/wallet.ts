import { FC } from 'react';

import { RosenChainToken, TokenMap } from '@rosen-bridge/tokens';
import { Network, RosenAmountValue } from '@rosen-ui/types';

import { BalanceFetchError, UnavailableApiError } from './errors';

export interface WalletTransferParams {
  token: RosenChainToken;
  amount: RosenAmountValue;
  fromChain: Network;
  toChain: Network;
  address: string;
  bridgeFee: RosenAmountValue;
  networkFee: RosenAmountValue;
  lockAddress: string;
}

export type WalletConfig = {
  getTokenMap: () => Promise<TokenMap>;
};

/**
 * main wallet type for the bridge, all wallets implement
 * this interface to unify access and interaction with wallets
 */
export abstract class Wallet<Config extends WalletConfig = WalletConfig> {
  abstract icon: FC;
  abstract name: string;
  abstract label: string;
  abstract link: string;
  abstract currentChain: Network;
  abstract supportedChains: Network[];

  constructor(protected config: Config) {}

  abstract connect: () => Promise<void>;
  abstract disconnect: () => Promise<void>;
  abstract getAddress: () => Promise<string>;
  abstract getBalanceRaw: (
    token: RosenChainToken,
  ) => Promise<bigint | number | string | undefined>;
  abstract isAvailable: () => boolean;
  abstract transfer: (params: WalletTransferParams) => Promise<string>;

  isConnected?: () => Promise<boolean>;
  switchChain?: (chain: Network, silent?: boolean) => Promise<void>;

  getBalance = async (token: RosenChainToken): Promise<RosenAmountValue> => {
    this.requireAvailable();

    let raw;

    try {
      raw = await this.getBalanceRaw(token);
    } catch (error) {
      throw new BalanceFetchError(this.name, error);
    }

    if (!raw) return 0n;

    const amount = BigInt(raw);

    if (!amount) return 0n;

    const tokenMap = await this.config.getTokenMap();

    const wrappedAmount = tokenMap.wrapAmount(
      token.tokenId,
      amount,
      this.currentChain,
    ).amount;

    return wrappedAmount;
  };

  protected requireAvailable: () => void = () => {
    if (!this.isAvailable()) {
      throw new UnavailableApiError(this.name);
    }
  };
}
