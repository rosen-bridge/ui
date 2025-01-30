import { NautilusIcon } from '@rosen-bridge/icons';
import { RosenChainToken } from '@rosen-bridge/tokens';
import { NETWORKS } from '@rosen-ui/constants';
import { RosenAmountValue } from '@rosen-ui/types';
import {
  DisconnectionFailedError,
  AddressRetrievalError,
  ConnectionRejectedError,
  ErgoTxProxy,
  SubmitTransactionError,
  UserDeniedTransactionSignatureError,
  UtxoFetchError,
  Wallet,
  WalletTransferParams,
} from '@rosen-ui/wallet-api';

import { WalletConfig } from './types';

export class NautilusWallet implements Wallet {
  icon = NautilusIcon;

  name = 'Nautilus';

  label = 'Nautilus';

  link = 'https://github.com/nautls/nautilus-wallet';

  private get api() {
    return window.ergoConnector.nautilus;
  }

  constructor(private config: WalletConfig) {}

  async connect(): Promise<void> {
    const isConnected = await this.api.connect({ createErgoObject: false });

    if (isConnected) return;

    throw new ConnectionRejectedError(this.name);
  }

  async disconnect(): Promise<void> {
    try {
      await this.api.disconnect();
    } catch (error) {
      throw new DisconnectionFailedError(this.name, error);
    }
  }

  async getAddress(): Promise<string> {
    try {
      const wallet = await this.api.getContext();
      return await wallet.get_change_address();
    } catch (error) {
      throw new AddressRetrievalError(this.name, error);
    }
  }

  async getBalance(token: RosenChainToken): Promise<RosenAmountValue> {
    const wallet = await this.api.getContext();

    const tokenMap = await this.config.getTokenMap();

    const tokenId = token[tokenMap.getIdKey(NETWORKS.ERGO)];

    /**
     * The following condition is required because nautilus only accepts
     * uppercase ERG as tokenId for the erg native token
     */
    const balance = await wallet.get_balance(
      tokenId === 'erg' ? 'ERG' : tokenId,
    );

    const amount = BigInt(balance);

    if (!amount) return 0n;

    const wrappedAmount = tokenMap.wrapAmount(
      tokenId,
      amount,
      NETWORKS.ERGO,
    ).amount;

    return wrappedAmount;
  }

  isAvailable(): boolean {
    return (
      typeof window.ergoConnector !== 'undefined' &&
      !!window.ergoConnector.nautilus
    );
  }

  async isConnected(): Promise<boolean> {
    return await this.api.isAuthorized();
  }

  async transfer(params: WalletTransferParams): Promise<string> {
    const wallet = await this.api.getContext();

    const changeAddress = await this.getAddress();

    const walletUtxos = await wallet.get_utxos();

    if (!walletUtxos) throw new UtxoFetchError(this.name);

    const unsignedTx = await this.config.generateUnsignedTx(
      changeAddress,
      walletUtxos,
      params.lockAddress,
      params.toChain,
      params.address,
      params.amount,
      params.bridgeFee.toString(),
      params.networkFee.toString(),
      params.token,
    );

    let signedTx: ErgoTxProxy;

    try {
      signedTx = await wallet.sign_tx(unsignedTx);
    } catch (error) {
      throw new UserDeniedTransactionSignatureError(this.name, error);
    }
    try {
      return await wallet.submit_tx(signedTx);
    } catch (error) {
      throw new SubmitTransactionError(this.name, error);
    }
  }
}
