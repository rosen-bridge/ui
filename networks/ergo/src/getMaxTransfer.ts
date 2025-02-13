import { TokenMap } from '@rosen-bridge/tokens';
import { NATIVE_TOKENS, NETWORKS } from '@rosen-ui/constants';
import { RosenAmountValue } from '@rosen-ui/types';

import { fee as ergoFee, minBoxValue as ergoMinBoxValue } from './constants';

export const getMaxTransferCreator =
  (getTokenMap: () => Promise<TokenMap>) =>
  async ({
    balance,
    isNative,
  }: {
    balance: RosenAmountValue;
    isNative: boolean;
  }) => {
    const tokenMap = await getTokenMap();
    const feeAndMinBoxValueWrapped = tokenMap.wrapAmount(
      NATIVE_TOKENS.ERGO,
      ergoFee + ergoMinBoxValue,
      NETWORKS.ERGO,
    ).amount;
    const offset = isNative ? feeAndMinBoxValueWrapped : 0n;
    const amount = balance - offset;
    return amount < 0n ? 0n : amount;
  };
