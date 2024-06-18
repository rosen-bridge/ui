'use server';

import {
  generateOpReturnData as generateOpReturnDataCore,
  generateUnsignedTx as generateUnsignedTxCore,
  getAddressBalance as getAddressBalanceCore,
  submitTransaction as submitTransactionCore,
} from '@rosen-network/bitcoin';

export const generateOpReturnData = generateOpReturnDataCore;
export const generateUnsignedTx = generateUnsignedTxCore;
export const getAddressBalance = getAddressBalanceCore;
export const submitTransaction = submitTransactionCore;
