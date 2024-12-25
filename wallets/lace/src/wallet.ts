import { LaceIcon } from '@rosen-bridge/icons';
import { RosenChainToken } from '@rosen-bridge/tokens';
import { NETWORKS } from '@rosen-ui/constants';
import { hexToCbor } from '@rosen-ui/utils';
import { Wallet, WalletTransferParams } from '@rosen-ui/wallet-api';

import { WalletConfig } from './types';

export class LaceWallet implements Wallet {
  icon = LaceIcon;

  name = 'Lace';

  label = 'Lace';

  link = 'https://www.lace.io/';

  private get api() {
    return window.cardano.lace;
  }

  constructor(private config: WalletConfig) {}

  async connect(): Promise<boolean> {
    return !!(await this.api.enable());
  }

  async getAddress(): Promise<string> {
    return this.api.enable().then((wallet) => wallet.getChangeAddress());
  }

  async getBalance(token: RosenChainToken): Promise<bigint> {
    const context = await this.api.enable();

    const rawValue = await context.getBalance();

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
    return typeof window.cardano !== 'undefined' && !!window.cardano.lace;
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

    if (!walletUtxos) throw Error(`Failed to fetch wallet utxos`);

    const unsignedTxHex = await this.config.generateUnsignedTx(
      walletUtxos,
      params.lockAddress,
      changeAddressHex,
      params.token.policyId,
      params.token.assetName,
      params.amount,
      auxiliaryDataHex,
    );

    const signedTxHex = await this.config.setTxWitnessSet(
      unsignedTxHex,
      await wallet.signTx(unsignedTxHex, false),
    );

    const result = await wallet.submitTx(signedTxHex);

    return result;
  }
}
