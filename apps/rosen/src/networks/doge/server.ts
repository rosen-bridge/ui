'use server';

import {
  generateOpReturnData as generateOpReturnDataCore,
  generateUnsignedTx as generateUnsignedTxCore,
  getAddressBalance as getAddressBalanceCore,
  getMaxTransferCreator as getMaxTransferCore,
  submitTransaction as submitTransactionCore,
} from '@rosen-network/doge';

import { wrap } from '@/safeServerAction';
import { getTokenMap } from '@/tokenMap/getServerTokenMap';

export const generateOpReturnData = wrap(generateOpReturnDataCore, {
  traceKey: 'doge:generateOpReturnData',
});

export const generateUnsignedTx = wrap(generateUnsignedTxCore(getTokenMap), {
  traceKey: 'doge:generateUnsignedTx',
});

export const getAddressBalance = wrap(getAddressBalanceCore, {
  cache: 3000,
  traceKey: 'doge:getAddressBalance',
});

export const getMaxTransfer = wrap(getMaxTransferCore(getTokenMap), {
  traceKey: 'doge:getMaxTransfer',
});

export const submitTransaction = wrap(submitTransactionCore, {
  traceKey: 'doge:submitTransaction',
});
