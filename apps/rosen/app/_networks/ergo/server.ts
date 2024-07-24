'use server';

import { generateUnsignedTx as generateUnsignedTxCore } from '@rosen-network/ergo';

import { wrap } from '@/_errors';

import { tokenMap } from '../tokenMap';

export const getTokenMap = wrap(async () => tokenMap);

export const generateUnsignedTx = wrap(generateUnsignedTxCore);
