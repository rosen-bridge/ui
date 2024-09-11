import { RosenChainToken } from '@rosen-bridge/tokens';
import { WalletCreatorConfig } from '@rosen-network/ethereum';
import { Networks } from '@rosen-ui/constants';
import { RosenAmountValue } from '@rosen-ui/types';

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

    const amount = await provider.request<string>({
      method: 'eth_getBalance',
      params: [accounts[0], 'latest'],
    });

    if (!amount) return 0n;

    const tokenMap = await config.getTokenMap();

    const wrappedAmount = tokenMap.wrapAmount(
      token[tokenMap.getIdKey(Networks.ETHEREUM)],
      BigInt(amount),
      Networks.ETHEREUM
    ).amount;

    return wrappedAmount;
  };
