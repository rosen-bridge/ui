'use server';

import { validateAddress as validateAddressCore } from '@rosen-network/base';
import {
  calculateFee as calculateFeeCore,
  generateOpReturnData as generateOpReturnDataCore,
  getMinTransferCreator,
} from '@rosen-network/handshake';

import { wrap } from '@/safeServerAction';
import { getTokenMap } from '@/tokenMap/getServerTokenMap';

export const calculateFee = wrap(calculateFeeCore, {
  cache: 10 * 60 * 1000,
  traceKey: 'handshake:calculateFee',
});

export const generateOpReturnData = wrap(generateOpReturnDataCore, {
  traceKey: 'handshake:generateOpReturnData',
});

export const getMinTransfer = wrap(getMinTransferCreator(getTokenMap), {
  traceKey: 'handshake:getMinTransfer',
});

export const validateAddress = wrap(validateAddressCore, {
  cache: Infinity,
  traceKey: 'handshake:validateAddress',
});
