'use server';

import { validateAddress as validateAddressCore } from '@rosen-network/base';
import {
  calculateFee as calculateFeeCore,
  generateLockTx as generateLockTxCore,
  getMinTransferCreator,
} from '@rosen-network/handshake';

import { wrap } from '@/safeServerAction';
import { getTokenMap } from '@/tokenMap/getServerTokenMap';

export const calculateFee = wrap(calculateFeeCore, {
  traceKey: 'handshake:calculateFee',
});

export const generateLockTx = wrap(generateLockTxCore(getTokenMap), {
  traceKey: 'handshake:generateLockTx',
});

export const getMinTransfer = wrap(getMinTransferCreator(getTokenMap), {
  traceKey: 'handshake:getMinTransfer',
});

export const validateAddress = wrap(validateAddressCore, {
  cache: Infinity,
  traceKey: 'handshake:validateAddress',
});
