'use server';

import { getMaxTransferCreator as getMaxTransferCore } from '@rosen-network/binance';
import {
  generateLockData as generateLockDataCore,
  generateTxParameters as generateTxParametersCore,
} from '@rosen-network/evm';

import { wrap } from '@/_safeServerAction';
import { getTokenMap } from '@/_tokenMap/getServerTokenMap';

export const generateLockData = wrap(generateLockDataCore, {
  traceKey: 'binance:generateLockData',
});

export const generateTxParameters = wrap(
  generateTxParametersCore(getTokenMap),
  {
    traceKey: 'binance:generateTxParameters',
  },
);

export const getMaxTransfer = wrap(getMaxTransferCore(getTokenMap), {
  traceKey: 'binance:getMaxTransfer',
});
