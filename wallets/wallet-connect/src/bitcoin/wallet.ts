import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';
import {
  AddressRetrievalError,
  UserDeniedTransactionSignatureError,
  WalletTransferParams,
} from '@rosen-ui/wallet-api';

import { WalletConnect } from '../abstract';
import { WalletConnectBitcoinConfig } from './types';

export class WalletConnectBitcoin extends WalletConnect<WalletConnectBitcoinConfig> {
  name = 'WalletConnectBitcoin';

  currentChain: Network = NETWORKS.bitcoin.key;

  supportedChains: Network[] = [NETWORKS.bitcoin.key];

  private get api() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.modal.getWalletProvider() as any;
  }

  getAddress = async (): Promise<string> => {
    await this.initialize();

    const address = this.modal.getAddress('bip122');
    const address1 = this.modal.getAddress('eip155');
    console.log(1111, address, address1);
    if (!address) throw new AddressRetrievalError(this.name);

    return address;
  };

  getBalanceRaw = async (): Promise<number> => {
    return (await this.api.getBalance()).confirmed;
  };

  isAvailable = (): boolean => {
    return true;
  };

  // isConnected = async (): Promise<boolean> => {
  //   return !!window.okxwallet.selectedAddress;
  // };

  transfer = async (params: WalletTransferParams): Promise<string> => {
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

    const txId = await this.config.submitTransaction(signedPsbtHex, 'hex');

    return txId;
  };
}
