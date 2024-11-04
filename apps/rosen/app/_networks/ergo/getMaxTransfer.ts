'use server';

import {
  fee as ergoFee,
  minBoxValue as ergoMinBoxValue,
} from '@rosen-network/ergo/dist/src/constants';
import { NETWORKS } from '@rosen-ui/constants';

import { wrap } from '@/_safeServerAction';
import { ErgoNetwork } from '@/_types/network';

import { getTokenMap } from '../getTokenMap.server';

/**
 * get max transfer for ergo
 */
const getMaxTransferCore: ErgoNetwork['getMaxTransfer'] = async ({
  balance,
  isNative,
}) => {
  const tokenMap = await getTokenMap();
  const feeAndMinBoxValueWrapped = tokenMap.wrapAmount(
    'erg',
    ergoFee + ergoMinBoxValue,
    NETWORKS.ERGO,
  ).amount;
  const offset = isNative ? feeAndMinBoxValueWrapped : 0n;
  const amount = balance - offset;
  return amount < 0n ? 0n : amount;
};

export const getMaxTransfer = wrap(getMaxTransferCore, {
  traceKey: 'getMaxTransferErgo',
});
