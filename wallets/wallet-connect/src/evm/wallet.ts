import { RosenChainToken } from '@rosen-bridge/tokens';
import { EvmChains } from '@rosen-network/evm';
import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';
import {
  AddressRetrievalError,
  UserDeniedTransactionSignatureError,
  WalletTransferParams,
} from '@rosen-ui/wallet-api';

import { WalletConnect } from '../abstract';
import { WalletConnectEVMConfig } from './types';

export class WalletConnectEVM extends WalletConnect {
  name = 'WalletConnectEVM';

  currentChain: Network = NETWORKS.ethereum.key;

  supportedChains: Network[] = [NETWORKS.binance.key, NETWORKS.ethereum.key];

  constructor(private config: WalletConnectEVMConfig) {
    super(config.projectId);
  }

  get currentChainId() {
    return `eip155:${Number(NETWORKS[this.currentChain].id)}`;
  }

  get namespaces() {
    return this.getNamespaces(this.currentChain);
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

    let amount = await this.config.getBalance(
      this.currentChain as EvmChains,
      address,
      token,
    );

    if (!amount) return 0n;

    const wrappedAmount = tokenMap.wrapAmount(
      token.tokenId,
      BigInt(amount),
      this.currentChain,
    ).amount;

    return wrappedAmount;
  };

  getChainId = (chain: Network) => {
    return `eip155:${Number(NETWORKS[chain].id)}`;
  };

  getNamespaces = (chain: Network) => {
    return {
      eip155: {
        accounts: [],
        chains: [this.getChainId(chain)],
        events: ['chainChanged', 'accountsChanged'],
        methods: [
          'eth_sendTransaction',
          'eth_signTransaction',
          'eth_sign',
          'personal_sign',
          'eth_signTypedData',
        ],
      },
    };
  };

  // switchChain = async (chain: Network, silent?: boolean): Promise<void> => {
  //   if (!this.supportedChains.includes(chain)) {
  //     throw new UnsupportedChainError(this.name, chain);
  //   }

  //   debugger;

  //   await this.signClient.update({
  //     topic: this.session!.topic,
  //     namespaces: this.getNamespaces(chain),
  //   });

  //   this.currentChain = chain;
  // };

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
        chainId: this.currentChainId,
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
