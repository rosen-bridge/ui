import { RosenChainToken, TokenMap } from '@rosen-bridge/tokens';
import { Network as NetworkBase } from '@rosen-network/base';
import { Network, RosenAmountValue } from '@rosen-ui/types';

import {
  AddressRetrievalError,
  BalanceFetchError,
  ConnectionRejectedError,
  UnavailableApiError,
  UnsupportedChainError,
} from './errors';

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
  networks: NetworkBase[];
  getTokenMap: () => Promise<TokenMap>;
};

/**
 * main wallet type for the bridge, all wallets implement
 * this interface to unify access and interaction with wallets
 */
export abstract class Wallet<Config extends WalletConfig = WalletConfig> {
  abstract icon: string;
  abstract name: string;
  abstract label: string;
  abstract link: string;
  abstract currentChain: Network;
  abstract supportedChains: Network[];

  constructor(protected config: Config) {}

  abstract performConnect: () => Promise<void>;
  abstract disconnect: () => Promise<void>;
  abstract fetchAddress: () => Promise<string | undefined>;
  abstract fetchBalance: (
    token: RosenChainToken,
  ) => Promise<bigint | number | string | undefined>;
  abstract isAvailable: () => boolean;
  abstract performTransfer: (params: WalletTransferParams) => Promise<string>;
  transfer = async (params: WalletTransferParams): Promise<string> => {
    this.requireAvailable();

    if (this.currentNetwork?.name != this.currentChain) {
      throw new UnsupportedChainError(this.name, this.currentChain);
    }

    return await this.performTransfer(params);
  };

  isConnected: () => Promise<boolean>;
  switchChain?: (chain: Network, silent?: boolean) => Promise<void>;

  get currentNetwork() {
    return this.config.networks.find(
      (network) => network.name == this.currentChain,
    );
  }

  connect = async (): Promise<void> => {
    this.requireAvailable();

    try {
      await this.performConnect();
    } catch (error) {
      throw new ConnectionRejectedError(this.name, error);
    }
  };

  getAddress = async (): Promise<string> => {
    this.requireAvailable();

    try {
      const address = await this.fetchAddress();

      if (!address) throw address;

      return address;
    } catch (error) {
      throw new AddressRetrievalError(this.name, error);
    }
  };

  getBalance = async (token: RosenChainToken): Promise<RosenAmountValue> => {
    this.requireAvailable();

    let raw;

    try {
      raw = await this.fetchBalance(token);
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
