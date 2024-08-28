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
import { toSafeData } from '@/_utils/safeData';

export const generateOpReturnData = wrap(toSafeData(generateOpReturnDataCore));
export const generateUnsignedTx = wrap(
  toSafeData(generateUnsignedTxCore(new TokenMap(getRosenTokens()))),
);
export const getAddressBalance = wrap(toSafeData(getAddressBalanceCore));
export const submitTransaction = wrap(toSafeData(submitTransactionCore));
