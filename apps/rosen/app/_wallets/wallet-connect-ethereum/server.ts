'use server';

import {
  generateLockData as generateLockDataCore,
  generateTxParameters as generateTxParametersCore,
} from '@rosen-network/evm';

import { wrap } from '@/_safeServerAction';
import { getTokenMap } from '@/_tokenMap/getServerTokenMap';

export const generateLockData = wrap(generateLockDataCore, {
  traceKey: 'generateLockData',
});

export const generateTxParameters = wrap(
  generateTxParametersCore(getTokenMap),
  {
    traceKey: 'generateTxParameters',
  },
);
