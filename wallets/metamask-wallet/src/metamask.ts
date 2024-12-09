import { MetaMaskSDK } from '@metamask/sdk';
import { MetaMaskIcon } from '@rosen-bridge/icons';
import { RosenChainToken } from '@rosen-bridge/tokens';
import { WalletCreatorConfig } from '@rosen-network/ethereum';
import { tokenABI } from '@rosen-network/ethereum/dist/src/constants';
import { NETWORKS } from '@rosen-ui/constants';
import { WalletNext, WalletNextTransferParams } from '@rosen-ui/wallet-api';
import { BrowserProvider, Contract } from 'ethers';

import { getMetaMaskWallet } from './getMetaMaskWallet';

export class MetamaskWallet implements WalletNext {
  icon = MetaMaskIcon;

  name = 'MetaMask';

  label = 'MetaMask';

  link = 'https://metamask.io/';

  api: MetaMaskSDK;
  constructor(private config: WalletCreatorConfig) {
    this.api = new MetaMaskSDK({
      dappMetadata: {
        name: 'Rosen Bridge',
      },
      enableAnalytics: false,
    });
  }

  async connect(): Promise<boolean> {
    let waiting;
    if (!waiting) {
      waiting = getMetaMaskWallet().getApi().connect();
    }

    const success = await waiting.then(
      () => true,
      () => false,
    );

    waiting = undefined;
    return success;
  }

  getAddress(): Promise<string> {
    throw new Error('Not implemented');
  }

  async getBalance(token: RosenChainToken): Promise<bigint> {
    const provider = getMetaMaskWallet().getApi().getProvider();

    if (!provider) return 0n;

    const accounts = await provider.request<string[]>({
      method: 'eth_accounts',
    });

    if (!accounts?.length) return 0n;

    const tokenMap = await this.config.getTokenMap();

    const tokenId = token[tokenMap.getIdKey(NETWORKS.ETHEREUM)];

    let amount;

    if (tokenId == 'eth') {
      amount = await provider.request<string>({
        method: 'eth_getBalance',
        params: [accounts[0], 'latest'],
      });
    } else {
      const browserProvider = new BrowserProvider(window.ethereum!);

      const contract = new Contract(
        tokenId,
        tokenABI,
        await browserProvider.getSigner(),
      );

      amount = await contract.balanceOf(accounts[0]);
    }

    if (!amount) return 0n;

    const wrappedAmount = tokenMap.wrapAmount(
      token[tokenMap.getIdKey(NETWORKS.ETHEREUM)],
      BigInt(amount),
      NETWORKS.ETHEREUM,
    ).amount;

    return wrappedAmount;
  }

  isAvailable(): boolean {
    return (
      typeof window.ethereum !== 'undefined' &&
      window.ethereum.isMetaMask &&
      !!window.ethereum._metamask
    );
  }

  async transfer(params: WalletNextTransferParams): Promise<string> {
    const provider = getMetaMaskWallet().getApi().getProvider();

    if (!provider) throw Error(`Failed to interact with metamask`);

    const accounts = await provider.request<string[]>({
      method: 'eth_accounts',
    });

    if (!accounts?.length)
      throw Error(`Failed to fetch accounts from metamask`);
    if (!accounts[0])
      throw Error(`Failed to get address of first account from metamask`);

    const rosenData = await this.config.generateLockData(
      params.toChain,
      params.address,
      params.networkFee.toString(),
      params.bridgeFee.toString(),
    );

    const tokenMap = await this.config.getTokenMap();
    const tokenId = params.token[tokenMap.getIdKey(NETWORKS.ETHEREUM)];

    const transactionParameters = await this.config.generateTxParameters(
      tokenId,
      params.lockAddress,
      accounts[0],
      params.amount,
      rosenData,
      params.token,
    );
    const result = await provider.request<string>({
      method: 'eth_sendTransaction',
      params: [transactionParameters],
    });

    return result ?? '';
  }
}
