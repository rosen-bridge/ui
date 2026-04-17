import { FiroNetwork } from '@rosen-network/firo/dist/client';
import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';
import {
  UnsupportedChainError,
  UserDeniedTransactionSignatureError,
  Wallet,
  WalletTransferParams,
} from '@rosen-ui/wallet-api';

import { ICON } from './icon';
import { FiroWalletConfig } from './types';

export class FiroWallet extends Wallet<FiroWalletConfig> {
  icon = ICON;

  name = 'Firo';

  label = 'Firo';

  link = 'https://firo.org/';

  currentChain: Network = NETWORKS.firo.key;

  supportedChains: Network[] = [NETWORKS.firo.key];

  private get api() {
    return window.firo;
  }

  performConnect = async (): Promise<void> => {
    if (await this.isConnected()) return;
    await this.api.connect();
  };

  performDisconnect = async (): Promise<void> => {
    await this.api.disconnect();
  };

  fetchAddress = async (): Promise<string | undefined> => {
    return (await this.api.getConnectionStatus()).selectedWalletAddress;
  };

  fetchBalance = async (): Promise<string> => {
    return (await this.api.getBalance()).balance;
  };

  isAvailable = (): boolean => {
    return typeof window.firo !== 'undefined' && !!window.firo;
  };

  hasConnection = async (): Promise<boolean> => {
    return (await this.api.getConnectionStatus()).isConnected;
  };

  performTransfer = async (params: WalletTransferParams): Promise<string> => {
    if (!(this.currentNetwork instanceof FiroNetwork)) {
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
      return await this.api.signAndBroadcastTransaction({
        rawTx: psbtData.psbt.hex,
        indexes: Array.from(Array(psbtData.inputSize).keys()),
        signOnly: false,
      });
    } catch (error) {
      throw new UserDeniedTransactionSignatureError(this.name, error);
    }
  };
}
