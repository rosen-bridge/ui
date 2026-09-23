import type { MetaMaskSDK } from '@metamask/sdk';

import type { RosenChainToken } from '@rosen-bridge/tokens';
import { BinanceNetwork } from '@rosen-network/binance/dist/client';
import { EthereumNetwork } from '@rosen-network/ethereum/dist/client';
import { tokenABI } from '@rosen-network/evm/dist/constants';
import { NETWORKS } from '@rosen-ui/constants';
import type { Network } from '@rosen-ui/types';
import {
  ChainNotAddedError,
  ChainSwitchingRejectedError,
  CurrentChainError,
  InteractionError,
  UnsupportedChainError,
  UserDeniedTransactionSignatureError,
  Wallet,
  WalletError,
  type WalletTransferParams,
} from '@rosen-ui/wallet-api';

import { ICON } from './icon';
import type { MetaMaskWalletConfig } from './types';

export class MetaMaskWallet extends Wallet<MetaMaskWalletConfig> {
  icon = ICON;

  name = 'MetaMask';

  label = 'MetaMask';

  link = 'https://metamask.io/';

  supportedChains: Network[] = [NETWORKS.binance.key, NETWORKS.ethereum.key];

  private _api?: MetaMaskSDK;

  private get api(): MetaMaskSDK {
    if (typeof window === 'undefined' || !this._api) {
      throw new InteractionError(this.name);
    }
    return this._api;
  }

  get currentChain(): Network {
    const chain = Object.values(NETWORKS).find(
      (network) => network.id === this.provider.chainId,
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

  private requireStandardAccount = async (): Promise<void> => {
    const address = await this.fetchAddress();

    if (!address) return;

    const code = await this.provider.request<string>({
      method: 'eth_getCode',
      params: [address, 'latest'],
    });

    if (!code?.toLowerCase().startsWith('0xef0100')) return;

    try {
      await this.api.disconnect();
    } catch {
      //
    }

    throw new WalletError(
      [
        "This account is a MetaMask Smart Account and can't be used right now",
        "Rosen can't yet process transfers sent from smart accounts (EIP-7702). If you continue, your tokens will reach the bridge address but the transfer will not be detected, and recovering them will require manual support.",
        'To continue, switch this account back to a standard account in MetaMask: Account menu (⋮) → Account details → Smart account → turn off the toggle for this network, then reload this page. Your address, funds and Secret Recovery Phrase do not change.',
      ].join('\n'),
    );
  };

  initialize = async (): Promise<void> => {
    if (this.isInitialized) return;

    /**
     * Lazy-load wallet resource to reduce initial bundle size and improve app startup performance
     */
    const { MetaMaskSDK } = await import('@metamask/sdk');

    this._api ||= new MetaMaskSDK({
      dappMetadata: {
        name: 'Rosen Bridge',
        url: window.location.origin,
      },
      enableAnalytics: false,
    });

    await this.api.init();

    this.isInitialized = true;
  };

  performConnect = async (): Promise<void> => {
    await this.api.connect();
  };

  performDisconnect = async (): Promise<void> => {
    await this.api.disconnect();
  };

  fetchAddress = async (): Promise<string | undefined> => {
    const accounts = await this.provider.request<string[]>({
      method: 'eth_accounts',
    });
    return accounts?.at(0);
  };

  fetchBalance = async (token: RosenChainToken): Promise<string | undefined | null> => {
    const { BrowserProvider, Contract } = await import('ethers');

    const address = await this.getAddress();

    let amount: string | undefined | null;

    if (token.type === 'native') {
      amount = await this.provider.request<string>({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });
    } else {
      const browserProvider = new BrowserProvider(window.ethereum!);

      const contract = new Contract(token.tokenId, tokenABI, await browserProvider.getSigner());

      amount = await contract.balanceOf(address);
    }

    return amount;
  };

  isAvailable = (): boolean => {
    return this.api.isExtensionActive();
  };

  hasConnection = async (): Promise<boolean> => {
    return !!(await this.permissions()).length;
  };

  performSwitchChain = async (chain: Network, silent?: boolean): Promise<void> => {
    const chainId = NETWORKS[chain].id;

    if (silent) {
      const has = (await this.permissions())
        .flatMap((permission) => permission.caveats)
        .some(
          (caveat) => caveat.type === 'restrictNetworkSwitching' && caveat.value.includes(chainId),
        );

      if (!has) throw new Error();
    }

    try {
      await this.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
    } catch (error) {
      /**
       * TODO: remove the inline Biome comment
       * local:ergo/rosen-bridge/ui#441
       */
      // biome-ignore lint/suspicious/noExplicitAny: Use a better type
      switch ((error as any)?.code) {
        case 4001:
          throw new ChainSwitchingRejectedError(this.name, chain, error);
        case 4902:
          throw new ChainNotAddedError(this.name, chain, error);
        default:
          throw error;
      }
    }

    await this.requireStandardAccount();
  };

  performTransfer = async (params: WalletTransferParams): Promise<string> => {
    if (
      !(this.currentNetwork instanceof BinanceNetwork) &&
      !(this.currentNetwork instanceof EthereumNetwork)
    ) {
      throw new UnsupportedChainError(this.name, this.currentChain);
    }

    await this.requireStandardAccount();

    const address = await this.getAddress();

    const rosenData = await this.currentNetwork.generateLockData(
      params.toChain,
      params.address,
      params.networkFee.toString(),
      params.bridgeFee.toString(),
    );

    const transactionParameters = await this.currentNetwork.generateTxParameters(
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
