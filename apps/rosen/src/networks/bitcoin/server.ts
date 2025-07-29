'use server';

import { validateAddress as validateAddressCore } from '@rosen-network/base';
import {
  calculateFee as calculateFeeCore,
  generateOpReturnData as generateOpReturnDataCore,
  generateUnsignedTx as generateUnsignedTxCore,
  getAddressBalance as getAddressBalanceCore,
  getMaxTransferCreator as getMaxTransferCore,
  submitTransaction as submitTransactionCore,
} from '@rosen-network/bitcoin';

import { wrap } from '@/safeServerAction';
import { getTokenMap } from '@/tokenMap/getServerTokenMap';

export const calculateFee = wrap(calculateFeeCore, {
  cache: 10 * 60 * 1000,
  traceKey: 'bitcoin:calculateFee',
});

export const generateOpReturnData = wrap(generateOpReturnDataCore, {
  traceKey: 'bitcoin:generateOpReturnData',
});

export const generateUnsignedTx = wrap(generateUnsignedTxCore(getTokenMap), {
  traceKey: 'bitcoin:generateUnsignedTx',
});

export const getAddressBalance = wrap(getAddressBalanceCore, {
  cache: 3000,
  traceKey: 'bitcoin:getAddressBalance',
});

export const getMaxTransfer = wrap(getMaxTransferCore(getTokenMap), {
  traceKey: 'bitcoin:getMaxTransfer',
});

export const submitTransaction = wrap(submitTransactionCore, {
  traceKey: 'bitcoin:submitTransaction',
});

export const validateAddress = wrap(validateAddressCore, {
  cache: Infinity,
  traceKey: 'bitcoin:validateAddress',
});
