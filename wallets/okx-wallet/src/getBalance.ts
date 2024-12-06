import { RosenChainToken } from '@rosen-bridge/tokens';
import { WalletCreatorConfig } from '@rosen-network/bitcoin';
import { NETWORKS } from '@rosen-ui/constants';
import { RosenAmountValue } from '@rosen-ui/types';

export const getBalanceCreator =
  (config: WalletCreatorConfig) =>
  async (token: RosenChainToken): Promise<RosenAmountValue> => {
    const amount = await window.okxwallet.bitcoin.getBalance();

    if (!amount.confirmed) return 0n;

    const tokenMap = await config.getTokenMap();

    const wrappedAmount = tokenMap.wrapAmount(
      token[tokenMap.getIdKey(NETWORKS.BITCOIN)],
      BigInt(amount.confirmed),
      NETWORKS.BITCOIN,
    ).amount;

    return wrappedAmount;
  };
