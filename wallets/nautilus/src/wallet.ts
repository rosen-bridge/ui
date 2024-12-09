import { NautilusIcon } from '@rosen-bridge/icons';
import { RosenChainToken } from '@rosen-bridge/tokens';
import { NETWORKS } from '@rosen-ui/constants';
import { Wallet, WalletTransferParams } from '@rosen-ui/wallet-api';

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

  async connect(): Promise<boolean> {
    if (!this.api) {
      throw new Error('EXTENSION_NOT_FOUND');
    }

    if (!this.api.getContext) {
      console.warn('Wallet API has changed. Please update your wallet.');
    }

    return await this.api.connect({ createErgoObject: false });
  }

  async getAddress(): Promise<string> {
    return this.api.getContext().then((wallet) => wallet.get_change_address());
  }

  async getBalance(token: RosenChainToken): Promise<bigint> {
    const context = await this.api.getContext();

    const tokenMap = await this.config.getTokenMap();

    const tokenId = token[tokenMap.getIdKey(NETWORKS.ERGO)];

    /**
     * The following condition is required because nautilus only accepts
     * uppercase ERG as tokenId for the erg native token
     */
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

  async transfer(params: WalletTransferParams): Promise<string> {
    const wallet = await this.api.getContext();

    const changeAddress = await this.getAddress();

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
