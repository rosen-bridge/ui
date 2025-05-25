import { AppKit, createAppKit } from '@reown/appkit';
import { BitcoinAdapter } from '@reown/appkit-adapter-bitcoin';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { mainnet, bitcoin, bsc } from '@reown/appkit/networks';
import { WalletConnect as WalletConnectIcon } from '@rosen-bridge/icons';
import { ConnectionRejectedError, Wallet } from '@rosen-ui/wallet-api';

import { WalletConnectConfig } from './types';

let modal: AppKit = createAppKit({
  networks: [mainnet, bitcoin, bsc],
  enableNetworkSwitch: false,
  adapters: [new EthersAdapter(), new BitcoinAdapter()],
  projectId: 'a95ba285168bef3d2e4fc7e6be193998',
  allWallets: 'HIDE',
  themeVariables: {
    '--w3m-z-index': 10000,
  },
});

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

  // abstract namespace: 'eip155' | 'bip122';

  initialize = async (): Promise<void> => {
    // if (this.modal) return;

    this.initialized = this.createDeferred();

    switch (this.currentChain) {
      case 'binance':
        modal.switchNetwork(bsc);
        break;
      case 'bitcoin':
        modal.switchNetwork(bitcoin);
        break;
      case 'ethereum':
        modal.switchNetwork(mainnet);
        break;
    }

    this.modal = modal!;

    // this.modal.addNetwork('eip155', mainnet)
    // this.modal.removeNetwork('eip155', '1')
    console.log(1, this.modal.getCaipNetwork('eip155', '1')?.caipNetworkId);
    console.log(2, this.modal.getCaipNetwork('eip155', '56')?.caipNetworkId);

    this.modal.subscribeEvents((event) => {
      console.log('subscribeEvents', event.data.event, event.data.type, event);

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
        // namespace: this.namespace,
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
    console.log(21212, this.modal.getChainId());
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
