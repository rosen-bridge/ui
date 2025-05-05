import { Okx as OKXIcon } from '@rosen-bridge/icons';
import { RosenChainToken } from '@rosen-bridge/tokens';
import { NETWORKS } from '@rosen-ui/constants';
import {
  DisconnectionFailedError,
  AddressRetrievalError,
  ConnectionRejectedError,
  UserDeniedTransactionSignatureError,
  Wallet,
  WalletTransferParams,
} from '@rosen-ui/wallet-api';

import { WalletConfig } from './types';

export class OKXWallet extends Wallet {
  icon = OKXIcon;

  name = 'OKX';

  label = 'OKX';

  link = 'https://www.okx.com/';

  supportedChains = [NETWORKS.bitcoin.key];

  constructor(private config: WalletConfig) {
    super();
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

  getBalance = async (token: RosenChainToken): Promise<bigint> => {
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
  };
}
