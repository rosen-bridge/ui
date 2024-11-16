'use server';

import { TokenMap } from '@rosen-bridge/tokens';
import {
  generateLockData as generateLockDataCore,
  generateTxParameters as generateTxParametersCore,
} from '@rosen-network/ethereum';

import { getRosenTokens } from '@/_backend/utils';
import { wrap } from '@/_safeServerAction';

export const generateLockData = wrap(generateLockDataCore, {
  traceKey: 'generateLockData',
});

export const generateTxParameters = wrap(
  generateTxParametersCore(new TokenMap(getRosenTokens())),
  {
    traceKey: 'generateTxParameters',
  },
);
