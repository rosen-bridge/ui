'use server';

import { validateAddress as validateAddressCore } from '@rosen-network/base';
import {
  calculateFee as calculateFeeCore,
  generateOpReturnData as generateOpReturnDataCore,
  generateUnsignedTx as generateUnsignedTxCore,
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

export const generateOpReturnData = wrap(generateOpReturnDataCore, {
  traceKey: 'bitcoin-runes:generateOpReturnData',
});

export const generateUnsignedTx = wrap(generateUnsignedTxCore(getTokenMap), {
  traceKey: 'bitcoin-runes:generateUnsignedTx',
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
