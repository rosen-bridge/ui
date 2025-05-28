import { Lace as LaceIcon } from '@rosen-bridge/icons';
import { RosenChainToken } from '@rosen-bridge/tokens';
import { CardanoNetwork } from '@rosen-network/cardano/dist/client';
import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';
import { hexToCbor } from '@rosen-ui/utils';
import {
  AddressRetrievalError,
  ConnectionRejectedError,
  SubmitTransactionError,
  UnsupportedChainError,
  UserDeniedTransactionSignatureError,
  UtxoFetchError,
  Wallet,
  WalletTransferParams,
} from '@rosen-ui/wallet-api';

import { LaceWalletConfig } from './types';

export class LaceWallet extends Wallet<LaceWalletConfig> {
  icon = LaceIcon;

  name = 'Lace';

  label = 'Lace';

  link = 'https://www.lace.io/';

  currentChain: Network = NETWORKS.cardano.key;

  supportedChains: Network[] = [NETWORKS.cardano.key];

  get currentNetwork() {
    return this.config.networks.find(
      (network) => network.name == this.currentChain,
    );
  }

  private get api() {
    return window.cardano.lace;
  }

  connect = async (): Promise<void> => {
    this.requireAvailable();
    try {
      await this.api.enable();
    } catch (error) {
      throw new ConnectionRejectedError(this.name, error);
    }
  };

  disconnect = async (): Promise<void> => {};

  getAddress = async (): Promise<string> => {
    this.requireAvailable();
    try {
      const wallet = await this.api.enable();
      return await wallet.getChangeAddress();
    } catch (error) {
      throw new AddressRetrievalError(this.name, error);
    }
  };

  getBalanceRaw = async (
    token: RosenChainToken,
  ): Promise<bigint | undefined> => {
    this.requireAvailable();

    if (!(this.currentNetwork instanceof CardanoNetwork)) {
      throw new UnsupportedChainError(this.name, this.currentChain);
    }

    const wallet = await this.api.enable();

    const rawValue = await wallet.getBalance();

    const balances = await this.currentNetwork.decodeWasmValue(rawValue);

    const amount = balances.find(
      (asset) =>
        asset.policyId === token.extra.policyId &&
        (asset.nameHex === hexToCbor(token.extra.assetName as string) ||
          !token.extra.policyId),
    );

    return amount?.quantity;
  };

  isAvailable = (): boolean => {
    return typeof window.cardano !== 'undefined' && !!window.cardano.lace;
  };

  isConnected = async (): Promise<boolean> => {
    this.requireAvailable();
    return await this.api.isEnabled();
  };

  transfer = async (params: WalletTransferParams): Promise<string> => {
    this.requireAvailable();

    if (!(this.currentNetwork instanceof CardanoNetwork)) {
      throw new UnsupportedChainError(this.name, this.currentChain);
    }

    const wallet = await this.api.enable();

    const changeAddressHex = await this.getAddress();

    const auxiliaryDataHex =
      await this.currentNetwork.generateLockAuxiliaryData(
        params.toChain,
        params.address,
        changeAddressHex,
        params.networkFee.toString(),
        params.bridgeFee.toString(),
      );

    const walletUtxos = await wallet.getUtxos();

    if (!walletUtxos) throw new UtxoFetchError(this.name);

    const unsignedTxHex = await this.currentNetwork.generateUnsignedTx(
      walletUtxos,
      params.lockAddress,
      changeAddressHex,
      params.token.extra.policyId as string,
      params.token.extra.assetName as string,
      params.amount,
      auxiliaryDataHex,
    );

    let witnessSetHex: string;

    try {
      witnessSetHex = await wallet.signTx(unsignedTxHex, false);
    } catch (error) {
      throw new UserDeniedTransactionSignatureError(this.name, error);
    }

    const signedTxHex = await this.currentNetwork.setTxWitnessSet(
      unsignedTxHex,
      witnessSetHex,
    );

    try {
      return await wallet.submitTx(signedTxHex);
    } catch (error) {
      throw new SubmitTransactionError(this.name, error);
    }
  };
}
