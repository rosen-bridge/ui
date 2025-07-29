'use server';

import { validateAddress as validateAddressCore } from '@rosen-network/base';
import {
  calculateFee as calculateFeeCore,
  getMaxTransferCreator as getMaxTransferCore,
  generateUnsignedTx as generateUnsignedTxCore,
} from '@rosen-network/ergo';

import { wrap } from '@/safeServerAction';
import { getTokenMap } from '@/tokenMap/getServerTokenMap';

export const calculateFee = wrap(calculateFeeCore, {
  cache: 10 * 60 * 1000,
  traceKey: 'ergo:calculateFee',
});

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
