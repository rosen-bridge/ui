'use server';

import { Networks } from '@rosen-ui/constants';

import { wrap } from '@/_errors';
import { EthereumNetwork } from '@/_types/network';

import { getTokenMap } from '../getTokenMap.server';
import { RosenAmountValue } from '@rosen-ui/types';
import { toSafeData } from '@/_utils/safeData';

/**
 * get max transfer for ethereum
 */
export const getMaxTransfer = wrap(
  toSafeData(
    async ({
      balance,
      isNative,
    }: Parameters<
      EthereumNetwork['getMaxTransfer']
    >[0]): Promise<RosenAmountValue> => {
      /**
       * TODO: This code is expected to be fully complete
       * local:ergo/rosen-bridge/ui#352
       */
      const tokenMap = await getTokenMap();
      const amount = tokenMap.wrapAmount(
        'eth',
        balance,
        Networks.ETHEREUM,
      ).amount;
      return amount;
    },
  ),
);
