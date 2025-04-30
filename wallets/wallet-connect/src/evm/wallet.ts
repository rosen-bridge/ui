import { RosenChainToken } from '@rosen-bridge/tokens';
import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';
import {
  AddressRetrievalError,
  UserDeniedTransactionSignatureError,
  WalletTransferParams,
} from '@rosen-ui/wallet-api';

import { WalletConnect } from '../abstract';
import { WalletConnectEVMConfig } from './types';

export abstract class WalletConnectEVM extends WalletConnect {
  abstract currentChain: Network;

  constructor(private config: WalletConnectEVMConfig) {
    super(config.projectId);
  }

  get chainId() {
    return `eip155:${Number(NETWORKS[this.currentChain].id)}`;
  }

  get name() {
    return 'WalletConnect' + this.currentChain;
  }

  get namespaces() {
    return {
      eip155: {
        accounts: [],
        chains: [this.chainId],
        events: ['chainChanged', 'accountsChanged'],
        methods: [
          'eth_sendTransaction',
          'eth_signTransaction',
          'eth_sign',
          'personal_sign',
          'eth_signTypedData',
          'eth_getBalance',
          'eth_call',
        ],
      },
    };
  }

  get supportedChains() {
    return [this.currentChain];
  }

  getAddress = async (): Promise<string> => {
    await this.initialize();

    const session = this.session;

    if (!session) throw new AddressRetrievalError(this.name);

    const [, , address] = session.namespaces['eip155'].accounts[0].split(':');

    if (!address) throw new AddressRetrievalError(this.name);

    return address;
  };

  getBalance = async (token: RosenChainToken): Promise<bigint> => {
    const address = await this.getAddress();

    const tokenMap = await this.config.getTokenMap();

    // let amount = await this.config.getBalance(
    //   this.currentChain as EvmChains,
    //   address,
    //   token,
    // );

    let request;

    if (token.type === 'native') {
      request = {
        method: 'eth_getBalance',
        params: [address, 'latest'],
      };
    } else {
      // Encode the data for balanceOf(address)
      const data = '0x70a08231' + address.replace('0x', '').padStart(64, '0'); // pad to 32 bytes

      request = {
        method: 'eth_call',
        params: [
          {
            to: token.tokenId,
            data,
          },
          'latest',
        ],
      };
    }

    const amount = await this.signClient.request<string>({
      topic: this.session!.topic,
      chainId: this.chainId,
      request,
    });

    if (!amount) return 0n;

    const wrappedAmount = tokenMap.wrapAmount(
      token.tokenId,
      BigInt(amount),
      this.currentChain,
    ).amount;

    return wrappedAmount;
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
      return (await this.signClient.request<string>({
        topic: this.session!.topic,
        chainId: this.chainId,
        request: {
          method: 'eth_sendTransaction',
          params: [transactionParameters],
        },
      }))!;
    } catch (error) {
      throw new UserDeniedTransactionSignatureError(this.name, error);
    }
  };
}
