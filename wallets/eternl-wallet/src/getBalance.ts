import { RosenChainToken } from '@rosen-bridge/tokens';
import { WalletCreatorConfig } from '@rosen-network/cardano';
import { Networks } from '@rosen-ui/constants';

import { getEternlWallet } from './getEternlWallet';

export const getBalanceCreator =
  (config: WalletCreatorConfig) =>
  async (token: RosenChainToken): Promise<number> => {
    const context = await getEternlWallet().getApi().enable();
    const rawValue = await context.getBalance();
    const balances = await config.decodeWasmValue(rawValue);

    const amount = balances.find((asset) => asset.policyId === token.policyId);

    if (!amount) return 0;

    const tokenMap = await config.getTokenMap();

    const wrappedAmount = tokenMap.wrapAmount(
      token[tokenMap.getIdKey(Networks.CARDANO)],
      amount.quantity,
      Networks.CARDANO
    ).amount;

    return Number(wrappedAmount);
  };
