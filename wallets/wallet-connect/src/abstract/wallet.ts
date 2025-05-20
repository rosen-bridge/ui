import { AppKit, createAppKit } from '@reown/appkit';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { mainnet } from '@reown/appkit/networks';
import { WalletConnect as WalletConnectIcon } from '@rosen-bridge/icons';
import { ConnectionRejectedError, Wallet } from '@rosen-ui/wallet-api';

import { WalletConnectConfig } from './types';

export abstract class WalletConnect<
  Config extends WalletConnectConfig,
> extends Wallet<Config> {
  icon = WalletConnectIcon;

  label = 'Wallet Connect';

  link = 'https://walletconnect.network/';

  modal: AppKit;

  connecting?: Promise<unknown>;

  connected: ReturnType<typeof this.createDeferred>;

  initialized: ReturnType<typeof this.createDeferred>;

  initialize = async (): Promise<void> => {
    if (this.modal) return;

    this.initialized = this.createDeferred();

    this.modal = createAppKit({
      adapters: [new EthersAdapter()],
      networks: [mainnet],
      projectId: this.config.projectId,
      allWallets: 'HIDE',
      themeVariables: {
        '--w3m-z-index': 10000,
      },
    });

    this.modal.subscribeEvents((event) => {
      switch (event.data.event) {
        case 'INITIALIZE':
          this.initialized.resolve();
          break;
        case 'MODAL_CLOSE':
          if (this.modal.getIsConnectedState()) {
            this.connected.resolve();
          } else {
            this.connected.reject();
          }
          break;
        case 'CONNECT_ERROR':
          this.connected.reject();
          break;
        case 'CONNECT_SUCCESS':
          this.connected.resolve();
          break;
      }
    });

    await this.initialized.promise;
  };

  connect = async (): Promise<void> => {
    this.connected = this.createDeferred();

    await this.initialize();

    if (this.modal.getIsConnectedState()) return;

    try {
      await this.modal.open({
        view: 'ConnectingWalletConnectBasic',
      });

      await this.connected.promise;
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

  createDeferred = () => {
    let resolve!: (value: void | PromiseLike<void>) => void;
    let reject!: (reason?: unknown) => void;

    const promise = new Promise<void>((res, rej) => {
      resolve = res;
      reject = rej;
    });

    return { promise, resolve, reject };
  };
}
