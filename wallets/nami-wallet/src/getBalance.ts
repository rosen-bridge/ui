import { RosenChainToken } from '@rosen-bridge/tokens';
import { WalletCreatorConfig } from '@rosen-network/cardano';
import { hexToCbor } from '@rosen-ui/utils';
import { Networks } from '@rosen-ui/constants';
import { RosenAmountValue } from '@rosen-ui/types';

import { getNamiWallet } from './getNamiWallet';

export const getBalanceCreator =
  (config: WalletCreatorConfig) =>
  async (token: RosenChainToken): Promise<RosenAmountValue> => {
    const context = await getNamiWallet().getApi().enable();
    const rawValue = await context.getBalance();
    const balances = await config.decodeWasmValue(rawValue);

    const amount = balances.find(
      (asset) =>
        asset.policyId === token.policyId &&
        (asset.nameHex === hexToCbor(token.assetName) || !token.policyId)
    );

    if (!amount) return 0n;

    const tokenMap = await config.getTokenMap();

    const wrappedAmount = tokenMap.wrapAmount(
      token[tokenMap.getIdKey(Networks.CARDANO)],
      amount.quantity,
      Networks.CARDANO
    ).amount;

    return wrappedAmount;
  };
