import { AppKit, Provider, createAppKit } from '@reown/appkit';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { mainnet, bsc } from '@reown/appkit/networks';
import { WalletConnect as WalletConnectIcon } from '@rosen-bridge/icons';
import { RosenChainToken } from '@rosen-bridge/tokens';
import { BinanceNetwork } from '@rosen-network/binance/dist/client';
import { EthereumNetwork } from '@rosen-network/ethereum/dist/client';
import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';
import {
  AddressRetrievalError,
  ConnectionRejectedError,
  CurrentChainError,
  UnsupportedChainError,
  UserDeniedTransactionSignatureError,
  Wallet,
  WalletTransferParams,
} from '@rosen-ui/wallet-api';

import { WalletConnectConfig } from './types';

let connected: ReturnType<typeof createDeferred>;

let initialized: ReturnType<typeof createDeferred>;

let modal: AppKit | undefined;

const createDeferred = () => {
  let resolve!: (value: void | PromiseLike<void>) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
};

const createModal = (projectId: string) => {
  if (modal) return;

  initialized = createDeferred();

  modal = createAppKit({
    networks: [mainnet, bsc],
    adapters: [new EthersAdapter()],
    projectId: projectId,
    allWallets: 'HIDE',
    themeVariables: {
      '--w3m-z-index': 10000,
    },
  });

  modal.subscribeEvents((event) => {
    switch (event.data.event) {
      case 'CONNECT_ERROR':
        connected.reject();
        break;
      case 'CONNECT_SUCCESS':
        connected.resolve();
        break;
      case 'INITIALIZE':
        initialized.resolve();
        break;
      case 'MODAL_CLOSE':
        if (modal!.getIsConnectedState()) {
          connected.resolve();
        } else {
          connected.reject();
        }
        break;
    }
  });
};

export class WalletConnect<
  Config extends WalletConnectConfig,
> extends Wallet<Config> {
  icon = WalletConnectIcon;

  name = 'WalletConnect';

  label = 'Wallet Connect';

  link = 'https://walletconnect.network/';

  supportedChains: Network[] = [NETWORKS.binance.key, NETWORKS.ethereum.key];

  get currentChain(): Network {
    switch (this.modal.getChainId()) {
      case 1:
        return NETWORKS.ethereum.key;
      case 56:
        return NETWORKS.binance.key;
      default:
        throw new CurrentChainError(this.name);
    }
  }

  get currentNetwork() {
    return this.config.networks.find(
      (network) => network.name == this.currentChain,
    );
  }

  get modal(): AppKit {
    return modal!;
  }

  get provider() {
    return this.modal.getWalletProvider() as Provider;
  }

  initialize = async (): Promise<void> => {
    createModal(this.config.projectId);

    await initialized.promise;
  };

  connect = async (): Promise<void> => {
    await this.initialize();

    if (this.modal.getIsConnectedState()) return;

    try {
      connected = createDeferred();

      await this.modal.open({
        view: 'ConnectingWalletConnectBasic',
      });

      await connected.promise;
    } catch (error) {
      throw new ConnectionRejectedError(this.name, error);
    }
  };

  disconnect = async (): Promise<void> => {
    await this.modal.disconnect();
  };

  isAvailable = (): boolean => {
    return true;
  };

  isConnected = async (): Promise<boolean> => {
    await this.initialize();
    return this.modal.getIsConnectedState();
  };

  getAddress = async (): Promise<string> => {
    await this.initialize();

    const address = this.modal.getAddress();

    if (!address) throw new AddressRetrievalError(this.name);

    return address;
  };

  getBalanceRaw = async (
    token: RosenChainToken,
  ): Promise<string | undefined> => {
    const address = await this.getAddress();

    let request;

    if (token.type === 'native') {
      request = {
        method: 'eth_getBalance',
        params: [address, 'latest'],
      };
    } else {
      request = {
        method: 'eth_call',
        params: [
          {
            to: token.tokenId,
            data: '0x70a08231' + address.replace('0x', '').padStart(64, '0'),
          },
          'latest',
        ],
      };
    }

    return await this.provider.request(request);
  };

  switchChain = async (chain: Network, silent?: boolean): Promise<void> => {
    if (!this.supportedChains.includes(chain)) {
      throw new UnsupportedChainError(this.name, chain);
    }

    if (this.modal.getChainId() == Number(NETWORKS[chain].id)) {
      return;
    }

    switch (chain) {
      case 'binance':
        await this.modal.switchNetwork(bsc);
        break;
      case 'ethereum':
        await this.modal.switchNetwork(mainnet);
        break;
    }
  };

  transfer = async (params: WalletTransferParams): Promise<string> => {
    this.requireAvailable();

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
      return (await this.provider.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      }))!;
    } catch (error) {
      throw new UserDeniedTransactionSignatureError(this.name, error);
    }
  };
}
