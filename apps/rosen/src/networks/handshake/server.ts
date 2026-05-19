'use server';

import { validateAddress as validateAddressCore } from '@rosen-network/base';
import {
  calculateFee as calculateFeeCore,
  generateOpReturnData as generateOpReturnDataCore,
  generateUnsignedTx as generateUnsignedTxCore,
  getAddressBalance as getAddressBalanceCore,
  getMaxTransferCreator,
  getMinTransferCreator,
  submitTransaction as submitTransactionCore,
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

export const generateUnsignedTx = wrap(generateUnsignedTxCore(getTokenMap), {
  traceKey: 'handshake:generateUnsignedTx',
});

export const getAddressBalance = wrap(getAddressBalanceCore, {
  cache: 3000,
  traceKey: 'handshake:getAddressBalance',
});

export const getMaxTransfer = wrap(getMaxTransferCreator(getTokenMap), {
  traceKey: 'handshake:getMaxTransfer',
});

export const getMinTransfer = wrap(getMinTransferCreator(getTokenMap), {
  traceKey: 'handshake:getMinTransfer',
});

export const submitTransaction = wrap(submitTransactionCore, {
  traceKey: 'handshake:submitTransaction',
});

export const validateAddress = wrap(validateAddressCore, {
  cache: Infinity,
  traceKey: 'handshake:validateAddress',
});
