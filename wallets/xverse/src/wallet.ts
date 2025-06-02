import { BitcoinNetwork } from '@rosen-network/bitcoin/dist/client';
import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';
import {
  AddressRetrievalError,
  ConnectionRejectedError,
  DisconnectionFailedError,
  UnsupportedChainError,
  UserDeniedTransactionSignatureError,
  Wallet,
  WalletTransferParams,
} from '@rosen-ui/wallet-api';
import { AddressPurpose, request } from 'sats-connect';

import { ICON } from './icon';
import { XverseWalletConfig } from './types';

export class XverseWallet extends Wallet<XverseWalletConfig> {
  icon = ICON;

  name = 'Xverse';

  label = 'Xverse';

  link = 'https://www.xverse.app/';

  currentChain: Network = NETWORKS.bitcoin.key;

  supportedChains: Network[] = [NETWORKS.bitcoin.key];

  get currentNetwork() {
    return this.config.networks.find(
      (network) => network.name == this.currentChain,
    );
  }

  connect = async (): Promise<void> => {
    this.requireAvailable();

    try {
      const response = await request('wallet_connect', null);

      if (response.status === 'success') return;

      throw response.error;
    } catch (error) {
      throw new ConnectionRejectedError(this.name, error);
    }
  };

  disconnect = async (): Promise<void> => {
    this.requireAvailable();

    try {
      const response = await request('wallet_disconnect', null);

      if (response.status === 'success') return;

      throw response.error;
    } catch (error) {
      throw new DisconnectionFailedError(this.name, error);
    }
  };

  getAddress = async (): Promise<string> => {
    this.requireAvailable();

    try {
      const response = await request('getAddresses', {
        purposes: [AddressPurpose.Payment],
      });

      if (response.status == 'error') throw response.error;

      const address = response.result.addresses.find(
        (address) => address.purpose === AddressPurpose.Payment,
      );

      return address!.address;
    } catch (error) {
      throw new AddressRetrievalError(this.name, error);
    }
  };

  getBalanceRaw = async (): Promise<string> => {
    const response = await request('getBalance', undefined);

    if (response.status === 'success') return response.result.confirmed;

    throw response.error;
  };

  isAvailable = (): boolean => {
    return (
      typeof window !== 'undefined' && !!window.XverseProviders?.BitcoinProvider
    );
  };

  isConnected = async (): Promise<boolean> => {
    try {
      return !!(await this.getAddress());
    } catch {
      return false;
    }
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

    let signedPsbtBase64;

    try {
      const response = await request('signPsbt', {
        psbt: psbtData.psbt.base64,
        signInputs: {
          [userAddress]: Array.from(Array(psbtData.inputSize).keys()),
        },
      });

      if (response.status === 'error') {
        throw response.error;
      }

      signedPsbtBase64 = response.result.psbt;
    } catch (error) {
      throw new UserDeniedTransactionSignatureError(this.name, error);
    }

    const txId = await this.currentNetwork.submitTransaction(
      signedPsbtBase64,
      'base64',
    );

    return txId;
  };
}
