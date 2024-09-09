import { RosenChainToken } from '@rosen-bridge/tokens';
import { WalletCreatorConfig } from '@rosen-network/ethereum';
import { RosenAmountValue } from '@rosen-ui/types';

import { getMetaMaskWallet } from './getMetaMaskWallet';

export const transferCreator =
  (config: WalletCreatorConfig) =>
  async (
    token: RosenChainToken,
    amount: RosenAmountValue,
    toChain: string,
    toAddress: string,
    bridgeFee: RosenAmountValue,
    networkFee: RosenAmountValue,
    lockAddress: string
  ): Promise<string> => {
    throw new Error('Hadi should consider implementing this logic');
  };
