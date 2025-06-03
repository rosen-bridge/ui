import { BitcoinNetwork } from '@rosen-network/bitcoin/dist/client';
import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';
import {
  DisconnectionFailedError,
  AddressRetrievalError,
  ConnectionRejectedError,
  UserDeniedTransactionSignatureError,
  Wallet,
  WalletTransferParams,
  UnsupportedChainError,
} from '@rosen-ui/wallet-api';

import { ICON } from './icon';
import { OKXWalletConfig } from './types';

export class OKXWallet extends Wallet<OKXWalletConfig> {
  icon = ICON;

  name = 'OKX';

  label = 'OKX';

  link = 'https://www.okx.com/';

  currentChain: Network = NETWORKS.bitcoin.key;

  supportedChains: Network[] = [NETWORKS.bitcoin.key];

  get currentNetwork() {
    return this.config.networks.find(
      (network) => network.name == this.currentChain,
    );
  }

  private get api() {
    return window.okxwallet.bitcoin;
  }

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
    this.requireAvailable();
    const accounts = await this.api.getAccounts();

    const account = accounts?.at(0);

    if (!account) throw new AddressRetrievalError(this.name);

    return account;
  };

  getBalanceRaw = async (): Promise<number> => {
    return (await this.api.getBalance()).confirmed;
  };

  isAvailable = (): boolean => {
    return (
      typeof window.okxwallet !== 'undefined' && !!window.okxwallet.bitcoin
    );
  };

  isConnected = async (): Promise<boolean> => {
    return !!window.okxwallet.selectedAddress;
  };

  transfer = async (params: WalletTransferParams): Promise<string> => {
    this.requireAvailable();

    if (!(this.currentNetwork instanceof BitcoinNetwork)) {
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

    let signedPsbtHex;

    try {
      signedPsbtHex = await this.api.signPsbt(psbtData.psbt.hex, {
        autoFinalized: false,
        toSignInputs: Array.from(Array(psbtData.inputSize).keys()).map(
          (index) => ({
            address: userAddress,
            index: index,
          }),
        ),
      });
    } catch (error) {
      throw new UserDeniedTransactionSignatureError(this.name, error);
    }

    const txId = await this.currentNetwork.submitTransaction(
      signedPsbtHex,
      'hex',
    );

    return txId;
  };
}
