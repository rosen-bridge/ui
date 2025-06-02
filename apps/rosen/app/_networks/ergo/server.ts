'use server';

import {
  getMaxTransferCreator as getMaxTransferCore,
  generateUnsignedTx as generateUnsignedTxCore,
} from '@rosen-network/ergo';

import { wrap } from '@/_safeServerAction';
import { getTokenMap } from '@/_tokenMap/getServerTokenMap';

export const generateUnsignedTx = wrap(generateUnsignedTxCore(getTokenMap), {
  traceKey: 'generateUnsignedTx',
});

export const getMaxTransfer = wrap(getMaxTransferCore(getTokenMap), {
  traceKey: 'getMaxTransfer',
});
