import { RosenChainToken } from '@rosen-bridge/tokens';
import { WalletCreatorConfig } from '@rosen-network/bitcoin';
import { tokenABI } from '@rosen-network/ethereum/dist/src/constants';
import { NETWORKS } from '@rosen-ui/constants';
import { RosenAmountValue } from '@rosen-ui/types';
import { BrowserProvider, Contract } from 'ethers';

import { getOKXWallet } from './getOKXWallet';

export const getBalanceCreator =
  (config: WalletCreatorConfig) =>
  async (token: RosenChainToken): Promise<RosenAmountValue> => {
    let res = await window.okxwallet.bitcoin.getBalance();
    return await new Promise((resolve, reject) => {
      config.getTokenMap().then((tokenMap) => {
        const amount = tokenMap.wrapAmount(
          token[tokenMap.getIdKey(NETWORKS.BITCOIN)],
          BigInt(res.confirmed),
          NETWORKS.BITCOIN,
        ).amount;
        resolve(amount);
      });
    });
  };
