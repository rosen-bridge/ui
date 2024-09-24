'use server';

import {
  fee as ergoFee,
  minBoxValue as ergoMinBoxValue,
} from '@rosen-network/ergo/dist/src/constants';
import { NETWORKS } from '@rosen-ui/constants';

import { wrap } from '@/_errors';
import { CardanoNetwork } from '@/_types/network';

import { getTokenMap } from '../getTokenMap.server';
import { RosenAmountValue } from '@rosen-ui/types';
import { toSafeData } from '@/_utils/safeData';

/**
 * get max transfer for ergo
 */
export const getMaxTransfer = wrap(
  toSafeData(
    async ({
      balance,
      isNative,
    }: Parameters<
      CardanoNetwork['getMaxTransfer']
    >[0]): Promise<RosenAmountValue> => {
      const tokenMap = await getTokenMap();
      const feeAndMinBoxValueWrapped = tokenMap.wrapAmount(
        'erg',
        ergoFee + ergoMinBoxValue,
        NETWORKS.ERGO,
      ).amount;
      const offset = isNative ? feeAndMinBoxValueWrapped : 0n;
      const amount = balance - offset;
      return amount < 0n ? 0n : amount;
    },
  ),
);
