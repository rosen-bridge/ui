'use server';

import { generateUnsignedTx as generateUnsignedTxCore } from '@rosen-network/ergo';

import { wrap } from '@/_safeServerAction';
import { TokenMap } from '@rosen-bridge/tokens';
import { getRosenTokens } from '@/_backend/utils';

export const generateUnsignedTx = wrap(
  generateUnsignedTxCore(new TokenMap(getRosenTokens())),
);
