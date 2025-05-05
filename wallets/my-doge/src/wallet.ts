import { Mydoge as MyDogeIcon } from '@rosen-bridge/icons';
import { RosenChainToken } from '@rosen-bridge/tokens';
import { NETWORKS } from '@rosen-ui/constants';
import {
  DisconnectionFailedError,
  ConnectionRejectedError,
  UserDeniedTransactionSignatureError,
  Wallet,
  WalletTransferParams,
  AddressRetrievalError,
} from '@rosen-ui/wallet-api';

import { WalletConfig } from './types';

export class MyDogeWallet extends Wallet {
  icon = MyDogeIcon;

  name = 'MyDoge';

  label = 'MyDoge';

  link = 'https://www.mydoge.com/';

  supportedChains = [NETWORKS.doge.key];

  private get api() {
    return window.doge;
  }

  constructor(private config: WalletConfig) {
    super();
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

  getBalance = async (token: RosenChainToken): Promise<bigint> => {
    this.requireAvailable();

    const amount = await this.api.getBalance();

    const tokenMap = await this.config.getTokenMap();

    const wrappedAmount = tokenMap.wrapAmount(
      token.tokenId,
      BigInt(amount.balance),
      NETWORKS.doge.key,
    ).amount;

    return wrappedAmount;
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

    const userAddress = await this.getAddress();

    const opReturnData = await this.config.generateOpReturnData(
      params.toChain,
      params.address,
      params.networkFee.toString(),
      params.bridgeFee.toString(),
    );

    const psbtData = await this.config.generateUnsignedTx(
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
