'use server';

import {
  fee as ergoFee,
  minBoxValue as ergoMinBoxValue,
} from '@rosen-network/ergo/dist/src/constants';
import { Networks } from '@rosen-ui/constants';

import { wrap } from '@/_errors';
import { CardanoNetwork } from '@/_types/network';

import { getTokenMap } from '../getTokenMap';
import { RosenAmountValue } from '@rosen-ui/types';

/**
 * get max transfer for ergo
 */
export const getMaxTransfer = wrap(
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
      Networks.ERGO,
    ).amount;
    const offsetCandidateWrapped = feeAndMinBoxValueWrapped;
    const shouldApplyOffset = isNative;
    const offset = shouldApplyOffset ? offsetCandidateWrapped : 0n;
    const amount = balance - offset;
    return amount < 0n ? 0n : amount;
  },
);
