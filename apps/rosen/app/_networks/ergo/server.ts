'use server';

import { generateUnsignedTx as generateUnsignedTxCore } from '@rosen-network/ergo';

import { wrap } from '@/_errors';

export const generateUnsignedTx = wrap(generateUnsignedTxCore);
