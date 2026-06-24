'use server';

import { validateAddress as validateAddressCore } from '@rosen-network/base';
import {
  buildPaymentUri as buildPaymentUriCore,
  calculateFee as calculateFeeCore,
  generateOpReturnData as generateOpReturnDataCore,
  generateUnsignedTx as generateUnsignedTxCore,
  getAddressBalance as getAddressBalanceCore,
  getMaxTransferCreator as getMaxTransferCore,
  getMinTransferCreator,
  submitTransaction as submitTransactionCore,
} from '@rosen-network/firo';

import { wrap } from '@/safeServerAction';
import { getTokenMap } from '@/tokenMap/getServerTokenMap';

export const buildPaymentUri = wrap(
  async (...args: Parameters<typeof buildPaymentUriCore>) => {
    return buildPaymentUriCore(...args);
  },
  {
    traceKey: 'firo:buildPaymentUri',
  },
);

export const calculateFee = wrap(calculateFeeCore, {
  cache: 10 * 60 * 1000,
  traceKey: 'firo:calculateFee',
});

export const generateOpReturnData = wrap(generateOpReturnDataCore, {
  traceKey: 'firo:generateOpReturnData',
});

export const generateUnsignedTx = wrap(generateUnsignedTxCore(getTokenMap), {
  traceKey: 'firo:generateUnsignedTx',
});

export const getAddressBalance = wrap(getAddressBalanceCore, {
  cache: 3000,
  traceKey: 'firo:getAddressBalance',
});

export const getMaxTransfer = wrap(getMaxTransferCore(getTokenMap), {
  traceKey: 'firo:getMaxTransfer',
});

export const getMinTransfer = wrap(getMinTransferCreator(getTokenMap), {
  traceKey: 'firo:getMinTransfer',
});

export const submitTransaction = wrap(submitTransactionCore, {
  traceKey: 'firo:submitTransaction',
});

export const validateAddress = wrap(validateAddressCore, {
  cache: Infinity,
  traceKey: 'firo:validateAddress',
});
