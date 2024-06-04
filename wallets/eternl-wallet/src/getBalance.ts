import { RosenChainToken } from '@rosen-bridge/tokens';

import { getEternlWallet } from './getEternlWallet';
import { EternlWalletCreator } from './types';

export const getBalanceCreator =
  (config: EternlWalletCreator) =>
  async (token: RosenChainToken): Promise<number> => {
    return 0;
    // const context = await getEternlWallet().api.enable();
    // const rawValue = await context.getBalance();
    // const balances = await config.decodeWasmValue(rawValue);

    // const amount = balances.find(
    //   (asset) => asset.policyId === token.policyId,
    // );
    // return amount ? Number(amount.quantity) : 0;
  };
