import { RosenChainToken } from '@rosen-bridge/tokens';
import { WalletCreatorConfig } from '@rosen-network/ethereum';
import { NETWORKS } from '@rosen-ui/constants';
import { Network, RosenAmountValue } from '@rosen-ui/types';

import { getMetaMaskWallet } from './getMetaMaskWallet';

export const transferCreator =
  (config: WalletCreatorConfig) =>
  async (
    token: RosenChainToken,
    amount: RosenAmountValue,
    toChain: Network,
    toAddress: string,
    bridgeFee: RosenAmountValue,
    networkFee: RosenAmountValue,
    lockAddress: string,
  ): Promise<string> => {
    const provider = getMetaMaskWallet().getApi().getProvider();

    if (!provider) throw Error(`Failed to interact with metamask`);

    const accounts = await provider.request<string[]>({
      method: 'eth_accounts',
    });

    if (!accounts?.length)
      throw Error(`Failed to fetch accounts from metamask`);
    if (!accounts[0])
      throw Error(`Failed to get address of first account from metamask`);

    const rosenData = await config.generateLockData(
      toChain,
      toAddress,
      networkFee.toString(),
      bridgeFee.toString(),
    );

    const tokenMap = await config.getTokenMap();
    const tokenId = token[tokenMap.getIdKey(NETWORKS.ETHEREUM)];

    const transactionParameters = await config.generateTxParameters(
      tokenId,
      lockAddress,
      accounts[0],
      amount,
      rosenData,
      token,
    );
    const result = await provider.request<string>({
      method: 'eth_sendTransaction',
      params: [transactionParameters],
    });

    return result ?? '';
  };
