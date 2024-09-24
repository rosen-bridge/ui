'use server';

import { feeAndMinBoxValue } from '@rosen-network/cardano/dist/src/constants';
import { NETWORKS } from '@rosen-ui/constants';

import { wrap } from '@/_errors';
import { CardanoNetwork } from '@/_types/network';

import { getTokenMap } from '../getTokenMap.server';
import { RosenAmountValue } from '@rosen-ui/types';
import { toSafeData } from '@/_utils/safeData';

/**
 * get max transfer for cardano
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
        'ada',
        feeAndMinBoxValue,
        NETWORKS.CARDANO,
      ).amount;
      const offset = isNative ? feeAndMinBoxValueWrapped : 0n;
      const amount = balance - offset;
      return amount < 0n ? 0n : amount;
    },
  ),
);
