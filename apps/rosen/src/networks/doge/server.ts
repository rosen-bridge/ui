'use server';

import { validateAddress as validateAddressCore } from '@rosen-network/base';
import {
  calculateFee as calculateFeeCore,
  generateLockTx as generateLockTxCore,
  getAddressBalance as getAddressBalanceCore,
  getMaxTransferCreator as getMaxTransferCore,
  getMinTransferCreator,
  submitTransaction as submitTransactionCore,
} from '@rosen-network/doge';

import { wrap } from '@/safeServerAction';
import { getTokenMap } from '@/tokenMap/getServerTokenMap';

export const calculateFee = wrap(calculateFeeCore, {
  traceKey: 'doge:calculateFee',
});

export const generateLockTx = wrap(generateLockTxCore(getTokenMap), {
  traceKey: 'doge:generateLockTx',
});

export const getAddressBalance = wrap(getAddressBalanceCore, {
  cache: 3000,
  traceKey: 'doge:getAddressBalance',
});

export const getMaxTransfer = wrap(getMaxTransferCore(getTokenMap), {
  traceKey: 'doge:getMaxTransfer',
});

export const getMinTransfer = wrap(getMinTransferCreator(getTokenMap), {
  traceKey: 'doge:getMinTransfer',
});

export const submitTransaction = wrap(submitTransactionCore, {
  traceKey: 'doge:submitTransaction',
});

export const validateAddress = wrap(validateAddressCore, {
  cache: Infinity,
  traceKey: 'doge:validateAddress',
});
