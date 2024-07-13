'use server';

import { generateUnsignedTx as generateUnsignedTxCore } from '@rosen-network/ergo';

import { unwrap } from '@/_errors';

export const generateUnsignedTx = unwrap(generateUnsignedTxCore);
