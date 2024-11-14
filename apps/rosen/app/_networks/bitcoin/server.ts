'use server';

import { TokenMap } from '@rosen-bridge/tokens';
import {
  generateOpReturnData as generateOpReturnDataCore,
  generateUnsignedTx as generateUnsignedTxCore,
  getAddressBalance as getAddressBalanceCore,
  submitTransaction as submitTransactionCore,
} from '@rosen-network/bitcoin';

import { getRosenTokens } from '@/_backend/utils';
import { wrap } from '@/_safeServerAction';

export const generateOpReturnData = wrap(generateOpReturnDataCore, {
  traceKey: 'generateOpReturnData',
});

export const generateUnsignedTx = wrap(
  generateUnsignedTxCore(new TokenMap(getRosenTokens())),
  {
    traceKey: 'generateUnsignedTx',
  },
);

export const getAddressBalance = wrap(getAddressBalanceCore, {
  cache: 3000,
  traceKey: 'getAddressBalance',
});

export const submitTransaction = wrap(submitTransactionCore, {
  traceKey: 'submitTransaction',
});
