'use server';

import { generateUnsignedTx as generateUnsignedTxCore } from '@rosen-ui/xdefi-wallet-next/dist/src/generateUnsignedTx';

import {
  generateOpReturnData as generateOpReturnDataCore,
  submitTransaction as submitTransactionCore,
  getAddressBalance as getAddressBalanceCore,
} from '@rosen-ui/xdefi-wallet-next/dist/src/utils';

export const generateOpReturnData = generateOpReturnDataCore;
export const generateUnsignedTx = generateUnsignedTxCore;
export const submitTransaction = submitTransactionCore;
export const getAddressBalance = getAddressBalanceCore;
