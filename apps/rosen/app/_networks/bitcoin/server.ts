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

const tokenMap = new TokenMap(getRosenTokens());

export const generateOpReturnData = wrap(generateOpReturnDataCore);
export const generateUnsignedTx = wrap(generateUnsignedTxCore(tokenMap));
export const getAddressBalance = wrap(getAddressBalanceCore);
export const submitTransaction = wrap(submitTransactionCore);
