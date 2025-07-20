'use server';

import {
  getMaxTransferCreator as getMaxTransferCore,
  generateUnsignedTx as generateUnsignedTxCore,
} from '@rosen-network/ergo';

import { wrap } from '@/safeServerAction';
import { getTokenMap } from '@/tokenMap/getServerTokenMap';

export const generateUnsignedTx = wrap(generateUnsignedTxCore(getTokenMap), {
  traceKey: 'ergo:generateUnsignedTx',
});

export const getMaxTransfer = wrap(getMaxTransferCore(getTokenMap), {
  traceKey: 'ergo:getMaxTransfer',
});
