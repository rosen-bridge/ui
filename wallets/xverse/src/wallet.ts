import type { request as Request } from 'sats-connect';

import type { RosenChainToken } from '@rosen-bridge/tokens';
import { BitcoinNetwork } from '@rosen-network/bitcoin/dist/client';
import { BitcoinRunesNetwork } from '@rosen-network/bitcoin-runes/dist/client';
import { NETWORKS } from '@rosen-ui/constants';
import type { Network } from '@rosen-ui/types';
import {
  NonNativeSegWitAddressError,
  NonTaprootAddressError,
  SubmitTransactionError,
  UnsupportedChainError,
  UserDeniedTransactionSignatureError,
  Wallet,
  type WalletTransferParams,
} from '@rosen-ui/wallet-api';

import { ICON } from './icon';
import { AddressPurpose, type XverseWalletConfig } from './types';

const request: typeof Request = (...props) => {
  /**
   * Lazy-load wallet resource to reduce initial bundle size and improve app startup performance
   */
  return import('sats-connect').then(({ request }) => request(...props));
};

export class XverseWallet extends Wallet<XverseWalletConfig> {
  icon = ICON;

  name = 'Xverse';

  label = 'Xverse';

  link = 'https://www.xverse.app/';

  currentChain: Network = NETWORKS.bitcoin.key;

  supportedChains: Network[] = [
    NETWORKS.bitcoin.key,
    NETWORKS['bitcoin-runes'].key,
  ];

  get purposes() {
    switch (this.currentChain) {
      case 'bitcoin':
        return [AddressPurpose.Payment];
      case 'bitcoin-runes':
        return [AddressPurpose.Payment, AddressPurpose.Ordinals];
      default:
        return [];
    }
  }

  performConnect = async (): Promise<void> => {
    const response = await request('wallet_connect', null);

    if (response.status === 'success') return;

    throw response.error;
  };

  performDisconnect = async (): Promise<void> => {
    const response = await request('wallet_disconnect', null);

    if (response.status === 'success') return;

    throw response.error;
  };

  fetchAddress = async (): Promise<string | undefined> => {
    switch (this.currentChain) {
      case 'bitcoin':
        return await this.findAddress(AddressPurpose.Payment).then(
          (address) => address?.address,
        );
      case 'bitcoin-runes':
        await this.findAddress(AddressPurpose.Payment).then(
          (address) => address?.address,
        );
        return await this.findAddress(AddressPurpose.Ordinals).then(
          (address) => address?.address,
        );
    }
  };

  findAddress = async (purpose: AddressPurpose) => {
    const response = await request('getAddresses', {
      purposes: [purpose],
    });

    if (response.status === 'error') throw response.error;

    const address = response.result.addresses.find(
      (address) => address.purpose === purpose,
    );

    switch (purpose) {
      case AddressPurpose.Ordinals: {
        const isNonTaproot = !address?.address.toLowerCase().startsWith('bc1p');

        if (isNonTaproot) {
          throw new NonTaprootAddressError(this.name);
        }

        break;
      }
      case AddressPurpose.Payment: {
        const isNonNativeSegWit = !address?.address
          .toLowerCase()
          .startsWith('bc1q');

        if (isNonNativeSegWit) {
          throw new NonNativeSegWitAddressError(this.name);
        }

        break;
      }
      default: {
        throw new Error(`Found no address with ${purpose} purpose`);
      }
    }

    return address;
  };

  fetchBalance = async (token?: RosenChainToken): Promise<string> => {
    if (this.currentChain === NETWORKS['bitcoin-runes'].key) {
      const response = await request('runes_getBalance', undefined);

      if (response.status === 'success') {
        const runeBalance = response.result.balances.find(
          (rune) => rune.runeName === token?.name,
        );
        return runeBalance?.spendableBalance ?? '0';
      }

      throw response.error;
    }

    const response = await request('getBalance', undefined);

    if (response.status === 'success') return response.result.confirmed;

    throw response.error;
  };

  isAvailable = (): boolean => {
    return (
      typeof window !== 'undefined' && !!window.XverseProviders?.BitcoinProvider
    );
  };

  hasConnection = async (): Promise<boolean> => {
    const response = await request('getAddresses', {
      purposes: this.purposes,
    });
    return response.status === 'success';
  };

  performSwitchChain = async (chain: Network): Promise<void> => {
    this.currentChain = chain;
  };

  performTransfer = async (params: WalletTransferParams): Promise<string> => {
    if (
      !(this.currentNetwork instanceof BitcoinNetwork) &&
      !(this.currentNetwork instanceof BitcoinRunesNetwork)
    ) {
      throw new UnsupportedChainError(this.name, this.currentChain);
    }

    const userAddress = await this.getAddress();

    const opReturnData = await this.currentNetwork.generateOpReturnData(
      params.toChain,
      params.address,
      params.networkFee.toString(),
      params.bridgeFee.toString(),
    );

    let signedPsbtBase64: string;

    if (this.currentNetwork instanceof BitcoinRunesNetwork) {
      const { publicKey: userPublicKey } = (await this.findAddress(
        AddressPurpose.Ordinals,
      ))!;
      const { address: userPaymentAddress } = (await this.findAddress(
        AddressPurpose.Payment,
      ))!;

      const { psbt, signInputs } = await this.currentNetwork.generateUnsignedTx(
        params.lockAddress,
        userAddress,
        userPaymentAddress,
        params.amount,
        opReturnData,
        params.token,
        userPublicKey,
      );

      try {
        const response = await request('signPsbt', {
          psbt,
          signInputs,
        });

        if (response.status === 'error') {
          throw response.error;
        }

        signedPsbtBase64 = response.result.psbt;
      } catch (error) {
        throw new UserDeniedTransactionSignatureError(this.name, error);
      }
    } else {
      const psbtData = await this.currentNetwork.generateUnsignedTx(
        params.lockAddress,
        userAddress,
        params.amount,
        opReturnData,
        params.token,
      );

      try {
        const response = await request('signPsbt', {
          psbt: psbtData.psbt.base64,
          signInputs: {
            [userAddress]: Array.from(Array(psbtData.inputSize).keys()),
          },
        });

        if (response.status === 'error') {
          throw response.error;
        }

        signedPsbtBase64 = response.result.psbt;
      } catch (error) {
        throw new UserDeniedTransactionSignatureError(this.name, error);
      }
    }

    try {
      return await this.currentNetwork.submitTransaction(
        signedPsbtBase64,
        'base64',
      );
    } catch (error) {
      throw new SubmitTransactionError(this.name, error);
    }
  };
}
