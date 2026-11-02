'use server';

import { validateAddress as validateAddressCore } from '@rosen-network/base';
import {
  calculateFee as calculateFeeCore,
  generateLockTx as generateLockTxCore,
  getMaxTransferCreator as getMaxTransferCore,
  getMinTransferCreator,
  submitTransaction as submitTransactionCore,
} from '@rosen-network/bitcoin-runes';

import { wrap } from '@/safeServerAction';
import { getTokenMap } from '@/tokenMap/getServerTokenMap';

export const calculateFee = wrap(calculateFeeCore, {
  cache: 10 * 60 * 1000,
  traceKey: 'bitcoin-runes:calculateFee',
});

export const generateLockTx = wrap(generateLockTxCore(getTokenMap), {
  traceKey: 'bitcoin-runes:generateLockTx',
});

export const getMaxTransfer = wrap(getMaxTransferCore(), {
  traceKey: 'bitcoin-runes:getMaxTransfer',
});

export const getMinTransfer = wrap(getMinTransferCreator(getTokenMap), {
  traceKey: 'bitcoin-runes:getMinTransfer',
});

export const submitTransaction = wrap(submitTransactionCore, {
  traceKey: 'bitcoin-runes:submitTransaction',
});

export const validateAddress = wrap(validateAddressCore, {
  cache: Infinity,
  traceKey: 'bitcoin-runes:validateAddress',
});
