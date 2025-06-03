import { DogeNetwork } from '@rosen-network/doge/dist/client';
import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';
import {
  DisconnectionFailedError,
  ConnectionRejectedError,
  UserDeniedTransactionSignatureError,
  Wallet,
  WalletTransferParams,
  AddressRetrievalError,
  UnsupportedChainError,
} from '@rosen-ui/wallet-api';

import { ICON } from './icon';
import { MyDogeWalletConfig } from './types';

export class MyDogeWallet extends Wallet<MyDogeWalletConfig> {
  icon = ICON;

  name = 'MyDoge';

  label = 'MyDoge';

  link = 'https://www.mydoge.com/';

  currentChain: Network = NETWORKS.doge.key;

  supportedChains: Network[] = [NETWORKS.doge.key];

  get currentNetwork() {
    return this.config.networks.find(
      (network) => network.name == this.currentChain,
    );
  }

  private get api() {
    return window.doge;
  }

  connect = async (): Promise<void> => {
    this.requireAvailable();

    if (await this.isConnected()) return;

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
    this.requireAvailable();
    try {
      return (await this.api.getConnectionStatus()).selectedWalletAddress;
    } catch (error) {
      throw new AddressRetrievalError(this.name, error);
    }
  };

  getBalanceRaw = async (): Promise<string> => {
    return (await this.api.getBalance()).balance;
  };

  isAvailable = (): boolean => {
    return typeof window.doge !== 'undefined' && !!window.doge;
  };

  isConnected = async (): Promise<boolean> => {
    try {
      return (await this.api.getConnectionStatus()).connected;
    } catch {
      return false;
    }
  };

  transfer = async (params: WalletTransferParams): Promise<string> => {
    this.requireAvailable();

    if (!(this.currentNetwork instanceof DogeNetwork)) {
      throw new UnsupportedChainError(this.name, this.currentChain);
    }

    const userAddress = await this.getAddress();

    const opReturnData = await this.currentNetwork.generateOpReturnData(
      params.toChain,
      params.address,
      params.networkFee.toString(),
      params.bridgeFee.toString(),
    );

    const psbtData = await this.currentNetwork.generateUnsignedTx(
      params.lockAddress,
      userAddress,
      params.amount,
      opReturnData,
      params.token,
    );

    try {
      const txId = (
        await this.api.requestPsbt({
          signOnly: false,
          indexes: Array.from(Array(psbtData.inputSize).keys()),
          rawTx: psbtData.psbt.hex,
        })
      ).txId;
      return txId;
    } catch (error) {
      throw new UserDeniedTransactionSignatureError(this.name, error);
    }
  };
}
