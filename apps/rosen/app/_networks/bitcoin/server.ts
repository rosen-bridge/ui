'use server';

import {
  generateOpReturnData as generateOpReturnDataCore,
  generateUnsignedTx as generateUnsignedTxCore,
  getAddressBalance as getAddressBalanceCore,
  submitTransaction as submitTransactionCore,
} from '@rosen-network/bitcoin';

import { wrap } from '@/_errors';

import { tokenMap } from '../tokenMap';

export const getTokenMap = wrap(async () => tokenMap);
export const generateOpReturnData = wrap(generateOpReturnDataCore);
export const generateUnsignedTx = wrap(generateUnsignedTxCore);
export const getAddressBalance = wrap(getAddressBalanceCore);
export const submitTransaction = wrap(submitTransactionCore);
