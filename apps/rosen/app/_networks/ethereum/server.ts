'use server';

import {
  generateLockData as generateLockDataCore,
  generateTxParameters as generateTxParametersCore,
} from '@rosen-network/ethereum';

import { wrap } from '@/_safeServerAction';
import { TokenMap } from '@rosen-bridge/tokens';
import { getRosenTokens } from '@/_backend/utils';

export const generateLockData = wrap(generateLockDataCore);
export const generateTxParameters = wrap(
  generateTxParametersCore(new TokenMap(getRosenTokens())),
);
