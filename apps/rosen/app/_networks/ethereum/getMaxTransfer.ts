'use server';

import { Networks } from '@rosen-ui/constants';

import { wrap } from '@/_errors';
import { EthereumNetwork } from '@/_types/network';

import { getTokenMap } from '../getTokenMap.server';
import { RosenAmountValue } from '@rosen-ui/types';
import { toSafeData } from '@/_utils/safeData';
import { ETH_TRANSFER_GAS, getFeeData } from '@rosen-network/ethereum';

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
      const feeData = await getFeeData();
      if (!feeData.gasPrice) throw Error(`gas price is null`);
      const estimatedFee = feeData.gasPrice * ETH_TRANSFER_GAS;
      const tokenMap = await getTokenMap();

      const wrappedFee = tokenMap.wrapAmount(
        'eth',
        estimatedFee,
        Networks.ETHEREUM,
      ).amount;
      return balance - wrappedFee;
    },
  ),
);
