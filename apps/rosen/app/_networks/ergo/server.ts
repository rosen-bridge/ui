'use server';

import { generateUnsignedTx as generateUnsignedTxCore } from '@rosen-network/ergo';

import { wrap } from '@/_errors';
import { TokenMap } from '@rosen-bridge/tokens';
import { getRosenTokens } from '@/_backend/utils';

const tokenMap = new TokenMap(getRosenTokens());

export const generateUnsignedTx = wrap(generateUnsignedTxCore(tokenMap));
