import { MetaMaskSDK } from '@metamask/sdk';
import { MetaMask as MetaMaskIcon } from '@rosen-bridge/icons';
import { RosenChainToken } from '@rosen-bridge/tokens';
import { tokenABI } from '@rosen-network/evm/dist/constants';
import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';
import {
  DisconnectionFailedError,
  ChainNotAddedError,
  ChainSwitchingRejectedError,
  UnsupportedChainError,
  Wallet,
  InteractionError,
  WalletTransferParams,
  AddressRetrievalError,
  ConnectionRejectedError,
  UserDeniedTransactionSignatureError,
  dispatchError,
  CurrentChainError,
} from '@rosen-ui/wallet-api';
import { BrowserProvider, Contract } from 'ethers';

import { MetaMaskWalletConfig } from './types';

export class MetaMaskWallet extends Wallet<MetaMaskWalletConfig> {
  icon = MetaMaskIcon;

  name = 'MetaMask';

  label = 'MetaMask';

  link = 'https://metamask.io/';

  supportedChains: Network[] = [NETWORKS.binance.key, NETWORKS.ethereum.key];

  private api = new MetaMaskSDK({
    dappMetadata: {
      name: 'Rosen Bridge',
    },
    enableAnalytics: false,
  });

  get currentChain(): Network {
    const chain = Object.values(NETWORKS).find(
      (network) => network.id == this.provider.chainId,
    )?.key;

    if (!chain) throw new CurrentChainError(this.name);

    return chain;
  }

  private get provider() {
    this.requireAvailable();
    const provider = this.api.getProvider();

    if (!provider) throw new InteractionError(this.name);

    return provider;
  }

  private permissions = async () => {
    return (await this.provider.request({
      method: 'wallet_getPermissions',
      params: [],
    })) as { caveats: { type: string; value: string[] }[] }[];
  };

  connect = async (): Promise<void> => {
    this.requireAvailable();
    try {
      await this.api.connect();
    } catch (error) {
      throw new ConnectionRejectedError(this.name, error);
    }
  };

  disconnect = async (): Promise<void> => {
    this.requireAvailable();
    try {
      await this.api.disconnect();
    } catch (error) {
      throw new DisconnectionFailedError(this.name, error);
    }
  };

  getAddress = async (): Promise<string> => {
    const accounts = await this.provider.request<string[]>({
      method: 'eth_accounts',
    });

    const account = accounts?.at(0);

    if (!account) throw new AddressRetrievalError(this.name);

    return account;
  };

  getBalanceRaw = async (
    token: RosenChainToken,
  ): Promise<string | undefined> => {
    const address = await this.getAddress();

    let amount;

    if (token.type === 'native') {
      amount = await this.provider.request<string>({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });
    } else {
      const browserProvider = new BrowserProvider(window.ethereum!);

      const contract = new Contract(
        token.tokenId,
        tokenABI,
        await browserProvider.getSigner(),
      );

      amount = await contract.balanceOf(address);
    }

    return amount;
  };

  isAvailable = (): boolean => {
    return this.api.isExtensionActive();
  };

  isConnected = async (): Promise<boolean> => {
    return !!(await this.permissions()).length;
  };

  switchChain = async (chain: Network, silent?: boolean): Promise<void> => {
    if (!this.supportedChains.includes(chain)) {
      throw new UnsupportedChainError(this.name, chain);
    }

    const chainId = NETWORKS[chain].id;

    if (silent) {
      const has = (await this.permissions())
        .map((permission) => permission.caveats)
        .flat()
        .some(
          (caveat) =>
            caveat.type === 'restrictNetworkSwitching' &&
            caveat.value.includes(chainId),
        );

      if (!has) throw new Error();
    }

    try {
      await this.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
    } catch (error) {
      dispatchError(error, {
        4001: () => new ChainSwitchingRejectedError(this.name, chain, error),
        4902: () => new ChainNotAddedError(this.name, chain, error),
      });
    }
  };

  transfer = async (params: WalletTransferParams): Promise<string> => {
    const address = await this.getAddress();

    const rosenData = await this.config.generateLockData(
      params.toChain,
      params.address,
      params.networkFee.toString(),
      params.bridgeFee.toString(),
    );

    const transactionParameters = await this.config.generateTxParameters(
      params.token.tokenId,
      params.lockAddress,
      address,
      params.amount,
      rosenData,
      params.token,
      params.fromChain,
    );

    try {
      return (await this.provider.request<string>({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      }))!;
    } catch (error) {
      throw new UserDeniedTransactionSignatureError(this.name, error);
    }
  };
}
