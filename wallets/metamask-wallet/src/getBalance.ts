import { RosenChainToken } from '@rosen-bridge/tokens';
import { WalletCreatorConfig } from '@rosen-network/ethereum';
import { tokenABI } from '@rosen-network/ethereum/dist/src/constants';
import { NETWORKS } from '@rosen-ui/constants';
import { RosenAmountValue } from '@rosen-ui/types';
import { BrowserProvider, Contract } from 'ethers';

import { getMetaMaskWallet } from './getMetaMaskWallet';

export const getBalanceCreator =
  (config: WalletCreatorConfig) =>
  async (token: RosenChainToken): Promise<RosenAmountValue> => {
    const provider = await getMetaMaskWallet().getApi().getProvider();

    if (!provider) return 0n;

    const accounts = await provider.request<string[]>({
      method: 'eth_accounts',
    });

    if (!accounts?.length) return 0n;

    const tokenMap = await config.getTokenMap();

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
        await browserProvider.getSigner()
      );

      amount = await contract.balanceOf(accounts[0]);
    }

    if (!amount) return 0n;

    const wrappedAmount = tokenMap.wrapAmount(
      token[tokenMap.getIdKey(NETWORKS.ETHEREUM)],
      BigInt(amount),
      NETWORKS.ETHEREUM
    ).amount;

    return wrappedAmount;
  };
