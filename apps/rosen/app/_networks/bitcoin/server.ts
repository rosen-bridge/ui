'use server';

import {
  generateOpReturnData as generateOpReturnDataCore,
  generateUnsignedTx as generateUnsignedTxCore,
  getAddressBalance as getAddressBalanceCore,
  submitTransaction as submitTransactionCore,
} from '@rosen-network/bitcoin';

import { wrap } from '@/_errors';
import { TokenMap } from '@rosen-bridge/tokens';
import { getRosenTokens } from '@/_backend/utils';
import { cache } from '@/_utils/cache';

export const generateOpReturnData = wrap(generateOpReturnDataCore);
export const generateUnsignedTx = wrap(
  generateUnsignedTxCore(new TokenMap(getRosenTokens())),
);
export const getAddressBalance = wrap(cache(getAddressBalanceCore, 15000));
export const submitTransaction = wrap(submitTransactionCore);
