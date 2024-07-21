import { RosenChainToken } from '@rosen-bridge/tokens';
import { WalletCreatorConfig } from '@rosen-network/cardano';

import { getFlintWallet } from './getFlintWallet';

export const getBalanceCreator =
  (config: WalletCreatorConfig) =>
  async (token: RosenChainToken): Promise<bigint> => {
    const context = await getFlintWallet().getApi().enable();
    const rawValue = await context.getBalance();
    const balances = await config.decodeWasmValue(rawValue);

    const amount = balances.find((asset) => asset.policyId === token.policyId);
    return amount ? BigInt(amount.quantity) : 0n;
  };
