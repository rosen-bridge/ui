import { Eternl as EternlIcon } from '@rosen-bridge/icons';
import { RosenChainToken } from '@rosen-bridge/tokens';
import { NETWORKS } from '@rosen-ui/constants';
import { RosenAmountValue } from '@rosen-ui/types';
import { hexToCbor } from '@rosen-ui/utils';
import {
  AddressRetrievalError,
  ConnectionRejectedError,
  SubmitTransactionError,
  UserDeniedTransactionSignatureError,
  UtxoFetchError,
  Wallet,
  WalletTransferParams,
} from '@rosen-ui/wallet-api';

import { WalletConfig } from './types';

export class EtrnlWallet extends Wallet {
  icon = EternlIcon;

  name = 'Eternl';

  label = 'Eternl';

  link = 'https://eternl.io';

  supportedChains = [NETWORKS.cardano.key];

  constructor(private config: WalletConfig) {
    super();
  }

  private get api() {
    return window.cardano.eternl;
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

  getBalance = async (token: RosenChainToken): Promise<RosenAmountValue> => {
    this.requireAvailable();

    const wallet = await this.api.enable();

    const rawValue = await wallet.getBalance();

    const balances = await this.config.decodeWasmValue(rawValue);

    const amount = balances.find(
      (asset) =>
        asset.policyId === token.extra.policyId &&
        (asset.nameHex === hexToCbor(token.extra.assetName as string) ||
          !token.extra.policyId),
    );

    if (!amount) return 0n;

    const tokenMap = await this.config.getTokenMap();

    const wrappedAmount = tokenMap.wrapAmount(
      token.tokenId,
      amount.quantity,
      NETWORKS.cardano.key,
    ).amount;

    return wrappedAmount;
  };

  isAvailable = (): boolean => {
    return typeof window.cardano !== 'undefined' && !!window.cardano.eternl;
  };

  transfer = async (params: WalletTransferParams): Promise<string> => {
    this.requireAvailable();

    const wallet = await this.api.enable();

    const changeAddressHex = await this.getAddress();

    const auxiliaryDataHex = await this.config.generateLockAuxiliaryData(
      params.toChain,
      params.address,
      changeAddressHex,
      params.networkFee.toString(),
      params.bridgeFee.toString(),
    );

    const walletUtxos = await wallet.getUtxos();

    if (!walletUtxos) throw new UtxoFetchError(this.name);

    const unsignedTxHex = await this.config.generateUnsignedTx(
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

    const signedTxHex = await this.config.setTxWitnessSet(
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
