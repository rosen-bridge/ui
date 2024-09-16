'use server';

import {
  generateLockData as generateLockDataCore,
  generateTxParameters as generateTxParametersCore,
} from '@rosen-network/ethereum';

import { wrap } from '@/_errors';
import { TokenMap } from '@rosen-bridge/tokens';
import { getRosenTokens } from '@/_backend/utils';
import { toSafeData } from '@/_utils/safeData';

export const generateLockData = wrap(generateLockDataCore);
export const generateTxParameters = wrap(
  toSafeData(generateTxParametersCore(new TokenMap(getRosenTokens()))),
);
