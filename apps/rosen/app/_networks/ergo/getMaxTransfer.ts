'use server';

import {
  fee as ergoFee,
  minBoxValue as ergoMinBoxValue,
} from '@rosen-network/ergo/dist/src/constants';
import { Networks } from '@rosen-ui/constants';

import { wrap } from '@/_errors';
import { CardanoNetwork } from '@/_types/network';

import { getTokenMap } from '../getTokenMap';

/**
 * get max transfer for ergo
 *
 * THIS FUNCTION WORKS WITH WRAPPED-VALUE
 *
 * @returns this is a WRAPPED-VALUE
 */
export const getMaxTransfer = wrap(
  async ({
    balance,
    isNative,
  }: Parameters<CardanoNetwork['getMaxTransfer']>[0]) => {
    const tokenMap = await getTokenMap();
    const feeAndMinBoxValueWrapped = tokenMap.wrapAmount(
      'erg',
      ergoFee + ergoMinBoxValue,
      Networks.ERGO,
    ).amount;
    const offsetCandidateWrapped = Number(feeAndMinBoxValueWrapped);
    const shouldApplyOffset = isNative;
    const offset = shouldApplyOffset ? offsetCandidateWrapped : 0;
    const amount = balance - offset;
    return amount < 0 ? 0 : amount;
  },
);
