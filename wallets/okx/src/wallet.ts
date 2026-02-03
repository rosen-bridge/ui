import { BitcoinNetwork } from '@rosen-network/bitcoin/dist/client';
import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';
import {
  UserDeniedTransactionSignatureError,
  Wallet,
  WalletTransferParams,
  UnsupportedChainError,
  SubmitTransactionError,
  NonNativeSegWitAddressError,
} from '@rosen-ui/wallet-api';

import { ICON } from './icon';
import { OKXWalletConfig } from './types';

export class OKXWallet extends Wallet<OKXWalletConfig> {
  icon = ICON;

  name = 'OKX';

  label = 'OKX';

  link = 'https://www.okx.com/';

  currentChain: Network = NETWORKS.bitcoin.key;

  supportedChains: Network[] = [NETWORKS.bitcoin.key];

  segwitNetworks: Network[] = [NETWORKS.bitcoin.key];

  private get api() {
    return window.okxwallet.bitcoin;
  }

  performConnect = async (): Promise<void> => {
    await this.api.connect();
  };

  performDisconnect = async (): Promise<void> => {
    await this.api.disconnect();
  };

  fetchAddress = async (): Promise<string | undefined> => {
    const address = (await this.api.getAccounts())?.at(0);

    const isNonNativeSegWit =
      address &&
      this.segwitNetworks.includes(this.currentChain) &&
      !address.toLowerCase().startsWith('bc1q');

    if (isNonNativeSegWit) {
      throw new NonNativeSegWitAddressError(this.name);
    }

    return address;
  };

  fetchBalance = async (): Promise<number> => {
    return (await this.api.getBalance()).confirmed;
  };

  isAvailable = (): boolean => {
    return (
      typeof window.okxwallet !== 'undefined' && !!window.okxwallet.bitcoin
    );
  };

  hasConnection = async (): Promise<boolean> => {
    return !!(await this.api.getAccounts())?.at(0);
  };

  performTransfer = async (params: WalletTransferParams): Promise<string> => {
    if (!(this.currentNetwork instanceof BitcoinNetwork)) {
      throw new UnsupportedChainError(this.name, this.currentChain);
    }

    const userAddress = await this.getAddress();

    const opReturnData = await this.currentNetwork.generateOpReturnData(
      params.toChain,
      params.address,
      params.networkFee.toString(),
      params.bridgeFee.toString(),
    );

    const psbtData = await this.currentNetwork.generateUnsignedTx(
      params.lockAddress,
      userAddress,
      params.amount,
      opReturnData,
      params.token,
    );

    let signedPsbtHex;

    try {
      signedPsbtHex = await this.api.signPsbt(psbtData.psbt.hex, {
        autoFinalized: false,
        toSignInputs: Array.from(Array(psbtData.inputSize).keys()).map(
          (index) => ({
            address: userAddress,
            index: index,
          }),
        ),
      });
    } catch (error) {
      throw new UserDeniedTransactionSignatureError(this.name, error);
    }

    try {
      return await this.currentNetwork.submitTransaction(signedPsbtHex, 'hex');
    } catch (error) {
      throw new SubmitTransactionError(this.name, error);
    }
  };
}
