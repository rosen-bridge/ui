import { RosenChainToken } from '@rosen-bridge/tokens';

import { getLaceWallet } from './getLaceWallet';
import { LaceWalletCreator } from './types';

export const getBalanceCreator =
  (config: LaceWalletCreator) =>
  async (token: RosenChainToken): Promise<number> => {
    const context = await getLaceWallet().api.enable();
    const rawValue = await context.getBalance();
    const balances = await config.decodeWasmValue(rawValue);

    const amount = balances.find((asset) => asset.policyId === token.policyId);
    return amount ? Number(amount.quantity) : 0;
  };
