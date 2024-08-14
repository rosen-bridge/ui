import { RosenChainToken } from '@rosen-bridge/tokens';
import { WalletCreatorConfig } from '@rosen-network/ergo';
import { Networks } from '@rosen-ui/constants';
import { RosenAmountValue } from '@rosen-ui/types';

import { getNautilusWallet } from './getNautilusWallet';

export const getBalanceCreator =
  (config: WalletCreatorConfig) =>
  async (token: RosenChainToken): Promise<RosenAmountValue> => {
    const context = await getNautilusWallet().getApi().getContext();

    const tokenMap = await config.getTokenMap();

    const tokenId = token[tokenMap.getIdKey(Networks.ERGO)];
    /**
     * The following condition is required because nautilus only accepts
     * uppercase ERG as tokenId for the erg native token
     */
    const balance = await context.get_balance(
      tokenId === 'erg' ? 'ERG' : tokenId
    );

    const amount = BigInt(balance);

    if (!amount) return 0n;

    const wrappedAmount = tokenMap.wrapAmount(
      tokenId,
      amount,
      Networks.ERGO
    ).amount;

    return wrappedAmount;
  };
