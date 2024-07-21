import { RosenChainToken } from '@rosen-bridge/tokens';
import { WalletCreatorConfig } from '@rosen-network/cardano';
import { Networks } from '@rosen-ui/constants';
import { hexToCbor } from '@rosen-ui/utils';

import { getNamiWallet } from './getNamiWallet';

export const getBalanceCreator =
  (config: WalletCreatorConfig) =>
  async (token: RosenChainToken): Promise<bigint> => {
    const context = await getNamiWallet().getApi().enable();
    const rawValue = await context.getBalance();
    const balances = await config.decodeWasmValue(rawValue);

    const amount = balances.find(
      (asset) =>
        asset.policyId === token.policyId &&
        (asset.nameHex === hexToCbor(token.assetName) || !token.policyId)
    );

    if (!amount) return 0n;

    return (await config.getTokenMap()).wrapAmount(
      'ada',
      amount.quantity,
      Networks.CARDANO
    ).amount;
  };
