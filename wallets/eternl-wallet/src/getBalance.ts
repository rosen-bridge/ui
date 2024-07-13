import { RosenChainToken } from '@rosen-bridge/tokens';
import { WalletCreatorConfig } from '@rosen-network/cardano';

import { getEternlWallet } from './getEternlWallet';

export const getBalanceCreator =
  (config: WalletCreatorConfig) =>
  async (token: RosenChainToken): Promise<number> => {
    const context = await getEternlWallet().getApi().enable();
    const rawValue = await context.getBalance();
    const balances = await config.decodeWasmValue(rawValue);

    const amount = balances.find((asset) => asset.policyId === token.policyId);
    return amount ? Number(amount.quantity) : 0;
  };
