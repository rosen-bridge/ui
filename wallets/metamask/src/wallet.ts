import { MetaMaskSDK } from '@metamask/sdk';
import { RosenChainToken } from '@rosen-bridge/tokens';
import { BinanceNetwork } from '@rosen-network/binance/dist/client';
import { EthereumNetwork } from '@rosen-network/ethereum/dist/client';
import { tokenABI } from '@rosen-network/evm/dist/constants';
import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';
import {
  ChainNotAddedError,
  ChainSwitchingRejectedError,
  UnsupportedChainError,
  Wallet,
  InteractionError,
  WalletTransferParams,
  UserDeniedTransactionSignatureError,
  CurrentChainError,
} from '@rosen-ui/wallet-api';
import { BrowserProvider, Contract } from 'ethers';

import { ICON } from './icon';
import { MetaMaskWalletConfig } from './types';

export class MetaMaskWallet extends Wallet<MetaMaskWalletConfig> {
  icon = ICON;

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

  fetchBalance = async (
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

  hasConnection = async (): Promise<boolean> => {
    return !!(await this.permissions()).length;
  };

  performSwitchChain = async (
    chain: Network,
    silent?: boolean,
  ): Promise<void> => {
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      switch ((error as any)?.code) {
        case 4001:
          throw new ChainSwitchingRejectedError(this.name, chain, error);
        case 4902:
          throw new ChainNotAddedError(this.name, chain, error);
        default:
          throw error;
      }
    }
  };

  performTransfer = async (params: WalletTransferParams): Promise<string> => {
    if (
      !(this.currentNetwork instanceof BinanceNetwork) &&
      !(this.currentNetwork instanceof EthereumNetwork)
    ) {
      throw new UnsupportedChainError(this.name, this.currentChain);
    }

    const address = await this.getAddress();

    const rosenData = await this.currentNetwork.generateLockData(
      params.toChain,
      params.address,
      params.networkFee.toString(),
      params.bridgeFee.toString(),
    );

    const transactionParameters =
      await this.currentNetwork.generateTxParameters(
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
