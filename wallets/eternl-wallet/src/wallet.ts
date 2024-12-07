import { EternlIcon } from '@rosen-bridge/icons';
import { RosenChainToken } from '@rosen-bridge/tokens';
import { WalletCreatorConfig } from '@rosen-network/cardano';
import { NETWORKS } from '@rosen-ui/constants';
import { hexToCbor } from '@rosen-ui/utils';
import { WalletNext, WalletNextTransferParams } from '@rosen-ui/wallet-api';

export class EtrnlWallet2 implements WalletNext {
  icon = EternlIcon;

  name = 'Eternl';

  label = 'Eternl';

  link = 'https://eternl.io';

  private get api() {
    return window.cardano.eternl;
  }

  constructor(private config: WalletCreatorConfig) {}

  async connect(): Promise<boolean> {
    return !!(await this.api.enable());
  }

  getAddress(): Promise<string> {
    return this.api.enable().then((wallet) => wallet.getChangeAddress());
  }

  async getBalance(token: RosenChainToken): Promise<bigint> {
    const context = await this.api.enable();

    const raw = await context.getBalance();

    const balances = await this.config.decodeWasmValue(raw);

    const balance = balances.find(
      (asset) =>
        asset.policyId === token.policyId &&
        (asset.nameHex === hexToCbor(token.assetName) || !token.policyId),
    );

    if (!balance) return 0n;

    const tokenMap = await this.config.getTokenMap();

    const value = tokenMap.wrapAmount(
      token[tokenMap.getIdKey(NETWORKS.CARDANO)],
      balance.quantity,
      NETWORKS.CARDANO,
    ).amount;

    return value;
  }

  isAvailable(): boolean {
    return typeof window.cardano !== 'undefined' && !!window.cardano.eternl;
  }

  async transfer(params: WalletNextTransferParams): Promise<string> {
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
