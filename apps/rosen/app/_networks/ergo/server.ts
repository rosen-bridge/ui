'use server';

import { TokenMap } from '@rosen-bridge/tokens';
import { generateUnsignedTx as generateUnsignedTxCore } from '@rosen-network/ergo';

import { getRosenTokens } from '@/_backend/utils';
import { wrap } from '@/_safeServerAction';

export const generateUnsignedTx = wrap(
  generateUnsignedTxCore(new TokenMap(getRosenTokens())),
  {
    traceKey: 'generateUnsignedTx',
  },
);
