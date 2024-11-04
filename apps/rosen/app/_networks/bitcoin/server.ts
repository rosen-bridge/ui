'use server';

import {
  generateOpReturnData as generateOpReturnDataCore,
  generateUnsignedTx as generateUnsignedTxCore,
  getAddressBalance as getAddressBalanceCore,
  submitTransaction as submitTransactionCore,
} from '@rosen-network/bitcoin';

import { wrap } from '@/_safeServerAction';
import { TokenMap } from '@rosen-bridge/tokens';
import { getRosenTokens } from '@/_backend/utils';

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
