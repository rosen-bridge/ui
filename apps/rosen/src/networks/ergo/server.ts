'use server';

import { validateAddress as validateAddressCore } from '@rosen-network/base';
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

export const validateAddress = wrap(validateAddressCore, {
  cache: Infinity,
  traceKey: 'ergo:validateAddress',
});
