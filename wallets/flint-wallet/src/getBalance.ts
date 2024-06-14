import { RosenChainToken } from '@rosen-bridge/tokens';

import { getFlintWallet } from './getFlintWallet';
import { FlintWalletCreator } from './types';

export const getBalanceCreator =
  (config: FlintWalletCreator) =>
  async (token: RosenChainToken): Promise<number> => {
    const context = await getFlintWallet().api.enable();
    const rawValue = await context.getBalance();
    const balances = await config.decodeWasmValue(rawValue);

    const amount = balances.find((asset) => asset.policyId === token.policyId);
    return amount ? Number(amount.quantity) : 0;
  };
