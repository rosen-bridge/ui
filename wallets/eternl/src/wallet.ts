import { EternlIcon } from '@rosen-bridge/icons';
import { RosenChainToken } from '@rosen-bridge/tokens';
import { NETWORKS } from '@rosen-ui/constants';
import { RosenAmountValue } from '@rosen-ui/types';
import { hexToCbor } from '@rosen-ui/utils';
import {
  ManualWalletDisconnectRequiredError,
  AddressRetrievalError,
  ConnectionRejectedError,
  SubmitTransactionError,
  UserDeniedTransactionSignatureError,
  UtxoFetchError,
  Wallet,
  WalletTransferParams,
} from '@rosen-ui/wallet-api';

import { WalletConfig } from './types';

export class EtrnlWallet implements Wallet {
  icon = EternlIcon;

  name = 'Eternl';

  label = 'Eternl';

  link = 'https://eternl.io';

  private get api() {
    return window.cardano.eternl;
  }

  constructor(private config: WalletConfig) {}

  async connect(): Promise<void> {
    try {
      await this.api.enable();
    } catch (error) {
      throw new ConnectionRejectedError(this.name, error);
    }
  }

  async disconnect(): Promise<void> {
    const massage =
      'Go to Settings > Connected Apps, find the app, and click Disconnect.';

    throw new ManualWalletDisconnectRequiredError(this.name, massage);
  }

  async getAddress(): Promise<string> {
    try {
      const wallet = await this.api.enable();
      return await wallet.getChangeAddress();
    } catch (error) {
      throw new AddressRetrievalError(this.name, error);
    }
  }

  async getBalance(token: RosenChainToken): Promise<RosenAmountValue> {
    const wallet = await this.api.enable();

    const rawValue = await wallet.getBalance();

    const balances = await this.config.decodeWasmValue(rawValue);

    const amount = balances.find(
      (asset) =>
        asset.policyId === token.policyId &&
        (asset.nameHex === hexToCbor(token.assetName) || !token.policyId),
    );

    if (!amount) return 0n;

    const tokenMap = await this.config.getTokenMap();

    const wrappedAmount = tokenMap.wrapAmount(
      token[tokenMap.getIdKey(NETWORKS.CARDANO)],
      amount.quantity,
      NETWORKS.CARDANO,
    ).amount;

    return wrappedAmount;
  }

  isAvailable(): boolean {
    return typeof window.cardano !== 'undefined' && !!window.cardano.eternl;
  }

  async transfer(params: WalletTransferParams): Promise<string> {
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
      params.token.policyId,
      params.token.assetName,
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
  }
}
