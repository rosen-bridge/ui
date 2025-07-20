'use server';

import {
  generateOpReturnData as generateOpReturnDataCore,
  generateUnsignedTx as generateUnsignedTxCore,
  getAddressBalance as getAddressBalanceCore,
  getMaxTransferCreator as getMaxTransferCore,
  submitTransaction as submitTransactionCore,
} from '@rosen-network/bitcoin';

import { wrap } from '@/safeServerAction';
import { getTokenMap } from '@/tokenMap/getServerTokenMap';

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
