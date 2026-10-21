'use server';

import { validateAddress as validateAddressCore } from '@rosen-network/base';
import {
  calculateFee as calculateFeeCore,
  generateLockTx as generateLockTxCore,
  getAddressBalance as getAddressBalanceCore,
  getMaxTransferCreator as getMaxTransferCore,
  getMinTransferCreator,
  submitTransaction as submitTransactionCore,
} from '@rosen-network/bitcoin';

import { wrap } from '@/safeServerAction';
import { getTokenMap } from '@/tokenMap/getServerTokenMap';

export const calculateFee = wrap(calculateFeeCore, {
  cache: 10 * 60 * 1000,
  traceKey: 'bitcoin:calculateFee',
});

export const generateLockTx = wrap(generateLockTxCore(getTokenMap), {
  traceKey: 'bitcoin:generateLockTx',
});

export const getAddressBalance = wrap(getAddressBalanceCore, {
  cache: 3000,
  traceKey: 'bitcoin:getAddressBalance',
});

export const getMaxTransfer = wrap(getMaxTransferCore(getTokenMap), {
  traceKey: 'bitcoin:getMaxTransfer',
});

export const getMinTransfer = wrap(getMinTransferCreator(getTokenMap), {
  traceKey: 'bitcoin:getMinTransfer',
});

export const submitTransaction = wrap(submitTransactionCore, {
  traceKey: 'bitcoin:submitTransaction',
});

export const validateAddress = wrap(validateAddressCore, {
  cache: Infinity,
  traceKey: 'bitcoin:validateAddress',
});
