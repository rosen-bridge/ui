import { Mydoge as MyDogeIcon } from '@rosen-bridge/icons';
import { RosenChainToken } from '@rosen-bridge/tokens';
import { NETWORKS } from '@rosen-ui/constants';
import {
  DisconnectionFailedError,
  ConnectionRejectedError,
  UnavailableApiError,
  UserDeniedTransactionSignatureError,
  Wallet,
  WalletTransferParams,
} from '@rosen-ui/wallet-api';

import { WalletConfig } from './types';

export class MyDogeWallet implements Wallet {
  icon = MyDogeIcon;

  name = 'MyDoge';

  label = 'MyDoge';

  link = 'https://www.mydoge.com/';

  supportedChains = [NETWORKS.doge.key];

  private get api() {
    return window.doge;
  }

  constructor(private config: WalletConfig) {}

  async connect(): Promise<void> {
    this.requireAvailable();
    try {
      const isConnected = await this.isConnected();
      if (isConnected) {
        return;
      }

      await this.api.connect();
    } catch (error) {
      throw new ConnectionRejectedError(this.name, error);
    }
  }

  async disconnect(): Promise<void> {
    this.requireAvailable();
    try {
      await this.api.disconnect();
    } catch (error) {
      throw new DisconnectionFailedError(this.name, error);
    }
  }

  async getAddress(): Promise<string> {
    this.requireAvailable();
    const account = await this.api.getConnectionStatus();
    return account.selectedWalletAddress;
  }

  async getBalance(token: RosenChainToken): Promise<bigint> {
    this.requireAvailable();
    const amount = await this.api.getBalance();

    const tokenMap = await this.config.getTokenMap();

    const wrappedAmount = tokenMap.wrapAmount(
      token.tokenId,
      BigInt(amount.balance),
      NETWORKS.doge.key,
    ).amount;

    return wrappedAmount;
  }

  isAvailable(): boolean {
    return typeof window.doge !== 'undefined' && !!window.doge;
  }

  requireAvailable() {
    if (!this.isAvailable()) throw new UnavailableApiError(this.name);
  }

  async isConnected(): Promise<boolean> {
    try {
      return (await this.api.getConnectionStatus()).connected;
    } catch (error) {
      throw new ConnectionRejectedError(this.name, error);
    }
  }

  async transfer(params: WalletTransferParams): Promise<string> {
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
  }
}
