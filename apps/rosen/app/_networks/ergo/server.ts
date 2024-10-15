'use server';

import { generateUnsignedTx as generateUnsignedTxCore } from '@rosen-network/ergo';

import { wrap } from '@/_errors';
import { TokenMap } from '@rosen-bridge/tokens';
import { getRosenTokens } from '@/_backend/utils';
import { toSafeData } from '@/_utils/safeData';

export const generateUnsignedTx = wrap(
  toSafeData(generateUnsignedTxCore(new TokenMap(getRosenTokens()))),
);
