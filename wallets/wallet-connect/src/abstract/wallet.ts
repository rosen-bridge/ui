import { AppKit, createAppKit } from '@reown/appkit';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { mainnet, bsc } from '@reown/appkit/networks';
import { WalletConnect as WalletConnectIcon } from '@rosen-bridge/icons';
import { NETWORKS } from '@rosen-ui/constants';
import { ConnectionRejectedError, Wallet } from '@rosen-ui/wallet-api';

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

export abstract class WalletConnect<
  Config extends WalletConnectConfig,
> extends Wallet<Config> {
  icon = WalletConnectIcon;

  label = 'Wallet Connect';

  link = 'https://walletconnect.network/';

  get modal(): AppKit {
    return modal!;
  }

  initialize = async (): Promise<void> => {
    createModal(this.config.projectId);

    await initialized.promise;

    if (this.modal.getChainId() == Number(NETWORKS[this.currentChain].id))
      return;

    switch (this.currentChain) {
      case 'binance':
        await this.modal.switchNetwork(bsc);
        break;
      case 'ethereum':
        await this.modal.switchNetwork(mainnet);
        break;
    }
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
}
