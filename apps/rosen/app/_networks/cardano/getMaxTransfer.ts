'use server';

import { feeAndMinBoxValue } from '@rosen-network/cardano/dist/src/constants';
import { NATIVE_TOKENS, NETWORKS } from '@rosen-ui/constants';

import { wrap } from '@/_safeServerAction';
import { CardanoNetwork } from '@/_types';

import { getTokenMap } from '../getTokenMap.server';

/**
 * get max transfer for cardano
 */
const getMaxTransferCore: CardanoNetwork['getMaxTransfer'] = async ({
  balance,
  isNative,
}) => {
  const tokenMap = await getTokenMap();
  const feeAndMinBoxValueWrapped = tokenMap.wrapAmount(
    NATIVE_TOKENS.CARDANO,
    feeAndMinBoxValue,
    NETWORKS.CARDANO,
  ).amount;
  const offset = isNative ? feeAndMinBoxValueWrapped : 0n;
  const amount = balance - offset;
  return amount < 0n ? 0n : amount;
};

export const getMaxTransfer = wrap(getMaxTransferCore, {
  traceKey: 'getMaxTransferCardano',
});
