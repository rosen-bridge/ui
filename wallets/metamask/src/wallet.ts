import { MetaMaskSDK } from '@metamask/sdk';
import { MetaMaskIcon } from '@rosen-bridge/icons';
import { RosenChainToken } from '@rosen-bridge/tokens';
import { tokenABI } from '@rosen-network/evm/dist/src/constants';
import { NETWORKS } from '@rosen-ui/constants';
import { Network, RosenAmountValue } from '@rosen-ui/types';
import {
  ChainNotAddedError,
  ChainSwitchingRejectedError,
  UnsupportedChainError,
  Wallet,
  InteractionError,
  WalletTransferParams,
  AddressRetrievalError,
  ConnectionRejectedError,
  UserDeniedTransactionSignatureError,
} from '@rosen-ui/wallet-api';
import { BrowserProvider, Contract } from 'ethers';

import { WalletConfig } from './types';

export class MetaMaskWallet implements Wallet {
  icon = MetaMaskIcon;

  name = 'MetaMask';

  label = 'MetaMask';

  link = 'https://metamask.io/';

  private api = new MetaMaskSDK({
    dappMetadata: {
      name: 'Rosen Bridge',
    },
    enableAnalytics: false,
  });

  private get provider() {
    const provider = this.api.getProvider();

    if (!provider) throw new InteractionError(this.name);

    return provider;
  }

  constructor(private config: WalletConfig) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private dispatchError(error: any, cases: { [key: number]: () => Error }) {
    if (error?.code in cases) {
      throw cases[error.code]();
    }
    if (error.message) {
      throw new Error(error.message, { cause: error });
    }
    throw error;
  }

  private async permissions() {
    return (await this.provider.request({
      method: 'wallet_getPermissions',
      params: [],
    })) as { caveats: { type: string; value: string[] }[] }[];
  }

  async connect(): Promise<void> {
    try {
      await this.api.connect();
    } catch (error) {
      this.dispatchError(error, {
        4001: () => new ConnectionRejectedError(this.name, error),
      });
    }
  }

  async getAddress(): Promise<string> {
    const accounts = await this.provider.request<string[]>({
      method: 'eth_accounts',
    });

    const account = accounts?.at(0);

    if (!account) throw new AddressRetrievalError(this.name);

    return account;
  }

  async getBalance(token: RosenChainToken): Promise<RosenAmountValue> {
    const address = await this.getAddress();

    const tokenMap = await this.config.getTokenMap();

    const tokenId = token[tokenMap.getIdKey(NETWORKS.ETHEREUM)];

    let amount;

    if (token.metaData.type === 'native') {
      amount = await this.provider.request<string>({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });
    } else {
      const browserProvider = new BrowserProvider(window.ethereum!);

      const contract = new Contract(
        tokenId,
        tokenABI,
        await browserProvider.getSigner(),
      );

      amount = await contract.balanceOf(address);
    }

    if (!amount) return 0n;

    const wrappedAmount = tokenMap.wrapAmount(
      token[tokenMap.getIdKey(NETWORKS.ETHEREUM)],
      BigInt(amount),
      NETWORKS.ETHEREUM,
    ).amount;

    return wrappedAmount;
  }

  isAvailable(): boolean {
    return this.api.isExtensionActive();
  }

  async isConnected(): Promise<boolean> {
    return !!(await this.permissions()).length;
  }

  async switchChain(chain: Network, silent?: boolean): Promise<void> {
    const chains = {
      [NETWORKS.BINANCE]: '0x38',
      [NETWORKS.ETHEREUM]: '0x1',
    } as { [key in Network]?: string };

    const chainId = chains[chain];

    if (!chainId) throw new UnsupportedChainError(this.name, chain);

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
      this.dispatchError(error, {
        4001: () => new ChainSwitchingRejectedError(this.name, chain, error),
        4902: () => new ChainNotAddedError(this.name, chain, error),
      });
    }
  }

  async transfer(params: WalletTransferParams): Promise<string> {
    const address = await this.getAddress();

    const rosenData = await this.config.generateLockData(
      params.toChain,
      params.address,
      params.networkFee.toString(),
      params.bridgeFee.toString(),
    );

    const tokenMap = await this.config.getTokenMap();

    const tokenId = params.token[tokenMap.getIdKey(NETWORKS.ETHEREUM)];

    const transactionParameters = await this.config.generateTxParameters(
      tokenId,
      params.lockAddress,
      address,
      params.amount,
      rosenData,
      params.token,
    );

    try {
      return (await this.provider.request<string>({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      }))!;
    } catch (error) {
      this.dispatchError(error, {
        4001: () => new UserDeniedTransactionSignatureError(this.name, error),
        // 4100: () =>  ,
      });
    }

    return '';
  }
}
