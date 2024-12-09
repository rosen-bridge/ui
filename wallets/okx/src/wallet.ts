import { OKXIcon } from '@rosen-bridge/icons';
import { RosenChainToken } from '@rosen-bridge/tokens';
import { NETWORKS } from '@rosen-ui/constants';
import { WalletNext, WalletNextTransferParams } from '@rosen-ui/wallet-api';

import { WalletConfig } from './types';

export class OKXWallet implements WalletNext {
  icon = OKXIcon;

  name = 'OKX';

  label = 'OKX';

  link = 'https://www.okx.com/';

  private get api() {
    return window.okxwallet.bitcoin;
  }

  constructor(private config: WalletConfig) {}

  async connect(): Promise<boolean> {
    try {
      await this.api.connect();
      return true;
    } catch {
      return false;
    }
  }

  async getAddress(): Promise<string> {
    return this.api.getAccounts().then((accounts: string[]) => accounts[0]);
  }

  async getBalance(token: RosenChainToken): Promise<bigint> {
    const amount = await this.api.getBalance();

    if (!amount.confirmed) return 0n;

    const tokenMap = await this.config.getTokenMap();

    const wrappedAmount = tokenMap.wrapAmount(
      token[tokenMap.getIdKey(NETWORKS.BITCOIN)],
      BigInt(amount.confirmed),
      NETWORKS.BITCOIN,
    ).amount;

    return wrappedAmount;
  }

  isAvailable(): boolean {
    return (
      typeof window.okxwallet !== 'undefined' && !!window.okxwallet.bitcoin
    );
  }

  async transfer(params: WalletNextTransferParams): Promise<string> {
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

    const signedPsbtHex = await this.api.signPsbt(psbtData.psbt.hex, {
      autoFinalized: false,
      toSignInputs: Array.from(Array(psbtData.inputSize).keys()).map(
        (index) => ({
          address: userAddress,
          index: index,
        }),
      ),
    });

    const txId = await this.config.submitTransaction(signedPsbtHex, 'hex');

    return txId;
  }
}
