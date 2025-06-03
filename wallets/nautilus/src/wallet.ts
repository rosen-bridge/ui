import { RosenChainToken } from '@rosen-bridge/tokens';
import { ErgoNetwork } from '@rosen-network/ergo/dist/client';
import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';
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
  ConnectionTimeoutError,
  UnsupportedChainError,
} from '@rosen-ui/wallet-api';

import { ICON } from './icon';
import { NautilusWalletConfig } from './types';

export class NautilusWallet extends Wallet<NautilusWalletConfig> {
  icon = ICON;

  name = 'Nautilus';

  label = 'Nautilus';

  link = 'https://github.com/nautls/nautilus-wallet';

  currentChain: Network = NETWORKS.ergo.key;

  supportedChains: Network[] = [NETWORKS.ergo.key];

  get currentNetwork() {
    return this.config.networks.find(
      (network) => network.name == this.currentChain,
    );
  }

  private get api() {
    return window.ergoConnector.nautilus;
  }

  connect = async (): Promise<void> => {
    this.requireAvailable();
    let isConnected: boolean;

    try {
      isConnected = await this.api.connect({ createErgoObject: false });
    } catch (error) {
      throw new ConnectionTimeoutError(this.name, error);
    }

    if (isConnected) return;

    throw new ConnectionRejectedError(this.name);
  };

  disconnect = async (): Promise<void> => {
    this.requireAvailable();
    const result = await this.api.disconnect();

    if (!result) {
      throw new DisconnectionFailedError(this.name);
    }
  };

  getAddress = async (): Promise<string> => {
    this.requireAvailable();
    try {
      const wallet = await this.api.getContext();
      return await wallet.get_change_address();
    } catch (error) {
      throw new AddressRetrievalError(this.name, error);
    }
  };

  getBalanceRaw = async (token: RosenChainToken): Promise<string> => {
    this.requireAvailable();

    const wallet = await this.api.getContext();

    /**
     * The following condition is required because nautilus only accepts
     * uppercase ERG as tokenId for the erg native token
     */
    const amount = await wallet.get_balance(
      token.tokenId === 'erg' ? 'ERG' : token.tokenId,
    );

    return amount;
  };

  isAvailable = (): boolean => {
    return (
      typeof window.ergoConnector !== 'undefined' &&
      !!window.ergoConnector.nautilus
    );
  };

  isConnected = async (): Promise<boolean> => {
    this.requireAvailable();
    return await this.api.isAuthorized();
  };

  transfer = async (params: WalletTransferParams): Promise<string> => {
    this.requireAvailable();

    if (!(this.currentNetwork instanceof ErgoNetwork)) {
      throw new UnsupportedChainError(this.name, this.currentChain);
    }

    const wallet = await this.api.getContext();

    const changeAddress = await this.getAddress();

    const walletUtxos = await wallet.get_utxos();

    if (!walletUtxos) throw new UtxoFetchError(this.name);

    const unsignedTx = await this.currentNetwork.generateUnsignedTx(
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
  };
}
