import { NautilusIcon } from '@rosen-bridge/icons';
import { RosenChainToken } from '@rosen-bridge/tokens';
import { WalletCreatorConfig } from '@rosen-network/ergo';
import { NETWORKS } from '@rosen-ui/constants';
import { WalletNext, WalletNextTransferParams } from '@rosen-ui/wallet-api';

export class NautilusWallet implements WalletNext {
  icon = NautilusIcon;

  name = 'Nautilus';

  label = 'Nautilus';

  link = 'https://github.com/nautls/nautilus-wallet';

  private get api() {
    return window.ergoConnector.nautilus;
  }

  constructor(private config: WalletCreatorConfig) {}

  async connect(): Promise<boolean> {
    if (!window.ergoConnector?.nautilus) {
      throw new Error('EXTENSION_NOT_FOUND');
    }

    if (!window.ergoConnector.nautilus?.getContext) {
      console.warn('Wallet API has changed. Please update your wallet.');
    }

    const nautilus = window.ergoConnector.nautilus;

    return await nautilus.connect({ createErgoObject: false });
  }

  async getAddress(): Promise<string> {
    return this.api.getContext().then((wallet) => wallet.get_change_address());
  }

  async getBalance(token: RosenChainToken): Promise<bigint> {
    const context = await this.api.getContext();

    const tokenMap = await this.config.getTokenMap();

    const tokenId = token[tokenMap.getIdKey(NETWORKS.ERGO)];

    const balance = await context.get_balance(
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

  async transfer(params: WalletNextTransferParams): Promise<string> {
    const wallet = await this.api.getContext();
    const changeAddress = await wallet.get_change_address();

    const walletUtxos = await wallet.get_utxos();
    if (!walletUtxos) throw Error(`No box found`);

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
    const signedTx = await wallet.sign_tx(unsignedTx);
    const result = await wallet.submit_tx(signedTx);
    return result;
  }
}
