'use server';

import {
  fee as ergoFee,
  minBoxValue as ergoMinBoxValue,
} from '@rosen-network/ergo/dist/src/constants';
import { NATIVE_TOKENS, NETWORKS } from '@rosen-ui/constants';

import { wrap } from '@/_safeServerAction';
import { getTokenMap } from '@/_tokenMap/getServerTokenMap';
import { ErgoNetwork } from '@/_types';

/**
 * get max transfer for ergo
 */
const getMaxTransferCore: ErgoNetwork['getMaxTransfer'] = async ({
  balance,
  isNative,
}) => {
  const tokenMap = getTokenMap();
  const feeAndMinBoxValueWrapped = tokenMap.wrapAmount(
    NATIVE_TOKENS.ERGO,
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
