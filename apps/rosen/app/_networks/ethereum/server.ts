'use server';

import { getMaxTransferCreator as getMaxTransferCore } from '@rosen-network/ethereum';
import {
  generateLockData as generateLockDataCore,
  generateTxParameters as generateTxParametersCore,
} from '@rosen-network/evm';

import { wrap } from '@/_safeServerAction';
import { getTokenMap } from '@/_tokenMap/getServerTokenMap';

export const generateLockData = wrap(generateLockDataCore, {
  traceKey: 'ethereum:generateLockData',
});

export const generateTxParameters = wrap(
  generateTxParametersCore(getTokenMap),
  {
    traceKey: 'ethereum:generateTxParameters',
  },
);

export const getMaxTransfer = wrap(getMaxTransferCore(getTokenMap), {
  traceKey: 'ethereum:getMaxTransfer',
});
