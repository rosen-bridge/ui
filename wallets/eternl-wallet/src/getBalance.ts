import { RosenChainToken } from '@rosen-bridge/tokens';
import { WalletCreatorConfig } from '@rosen-network/cardano';
import { Networks } from '@rosen-ui/constants';

import { getEternlWallet } from './getEternlWallet';

export const getBalanceCreator =
  (config: WalletCreatorConfig) =>
  async (token: RosenChainToken): Promise<bigint> => {
    const context = await getEternlWallet().getApi().enable();
    const rawValue = await context.getBalance();
    const balances = await config.decodeWasmValue(rawValue);

    const amount = balances.find((asset) => asset.policyId === token.policyId);

    if (!amount) return 0n;

    return (await config.getTokenMap()).wrapAmount(
      token.tokenId,
      amount.quantity,
      Networks.CARDANO
    ).amount;
  };
