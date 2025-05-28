import { Provider } from '@reown/appkit-adapter-ethers';
import { RosenChainToken } from '@rosen-bridge/tokens';
import { Network } from '@rosen-ui/types';
import {
  AddressRetrievalError,
  UserDeniedTransactionSignatureError,
  WalletTransferParams,
} from '@rosen-ui/wallet-api';

import { WalletConnect } from '../abstract';
import { WalletConnectEVMConfig } from './types';

export abstract class WalletConnectEVM extends WalletConnect<WalletConnectEVMConfig> {
  abstract currentChain: Network;

  get name() {
    return 'WalletConnect' + this.currentChain;
  }

  get provider() {
    return this.modal.getWalletProvider() as Provider;
  }

  get supportedChains() {
    return [this.currentChain];
  }

  getAddress = async (): Promise<string> => {
    await this.initialize();

    const address = this.modal.getAddress();

    if (!address) throw new AddressRetrievalError(this.name);

    return address;
  };

  getBalanceRaw = async (
    token: RosenChainToken,
  ): Promise<string | undefined> => {
    const address = await this.getAddress();

    let request;

    if (token.type === 'native') {
      request = {
        method: 'eth_getBalance',
        params: [address, 'latest'],
      };
    } else {
      request = {
        method: 'eth_call',
        params: [
          {
            to: token.tokenId,
            data: '0x70a08231' + address.replace('0x', '').padStart(64, '0'),
          },
          'latest',
        ],
      };
    }

    return await this.provider.request(request);
  };

  transfer = async (params: WalletTransferParams): Promise<string> => {
    const address = await this.getAddress();

    const rosenData = await this.config.generateLockData(
      params.toChain,
      params.address,
      params.networkFee.toString(),
      params.bridgeFee.toString(),
    );

    const transactionParameters = await this.config.generateTxParameters(
      params.token.tokenId,
      params.lockAddress,
      address,
      params.amount,
      rosenData,
      params.token,
      params.fromChain,
    );

    try {
      return (await this.provider.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      }))!;
    } catch (error) {
      throw new UserDeniedTransactionSignatureError(this.name, error);
    }
  };
}
