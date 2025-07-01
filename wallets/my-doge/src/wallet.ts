import { DogeNetwork } from '@rosen-network/doge/dist/client';
import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';
import {
  UserDeniedTransactionSignatureError,
  Wallet,
  WalletTransferParams,
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

  private get api() {
    return window.doge;
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
    return typeof window.doge !== 'undefined' && !!window.doge;
  };

  hasConnection = async (): Promise<boolean> => {
    try {
      return (await this.api.getConnectionStatus()).connected;
    } catch {
      return false;
    }
  };

  performTransfer = async (params: WalletTransferParams): Promise<string> => {
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
