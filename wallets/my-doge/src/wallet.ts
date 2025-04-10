import { Mydoge as MyDogeIcon } from '@rosen-bridge/icons';
import { RosenChainToken } from '@rosen-bridge/tokens';
import { NETWORKS } from '@rosen-ui/constants';
import {
  DisconnectionFailedError,
  AddressRetrievalError,
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

  supportedChains = [NETWORKS.bitcoin.key];

  private get api() {
    return window.doge;
  }

  constructor(private config: WalletConfig) {}

  async connect(): Promise<void> {
    this.requireAvailable();
    try {
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
    const accounts = await this.api.getAccounts();

    const account = accounts?.at(0);

    if (!account) throw new AddressRetrievalError(this.name);

    return account;
  }

  async getBalance(token: RosenChainToken): Promise<bigint> {
    this.requireAvailable();
    const amount = await this.api.getBalance();

    if (!amount.confirmed) return 0n;

    const tokenMap = await this.config.getTokenMap();

    const wrappedAmount = tokenMap.wrapAmount(
      token.tokenId,
      BigInt(amount.confirmed),
      NETWORKS.bitcoin.key,
    ).amount;

    return wrappedAmount;
  }

  isAvailable(): boolean {
    return (
      typeof window.doge !== 'undefined' && !!window.doge
    );
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

    const txId = await this.config.submitTransaction(signedPsbtHex, 'hex');

    return txId;
  }
}
