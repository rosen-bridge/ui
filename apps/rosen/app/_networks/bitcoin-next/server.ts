'use server';

import { generateUnsignedTx as generateUnsignedTxCore } from '@rosen-ui/xdefi-wallet-next/dist/src/transaction/generateTx';
import {
  generateOpReturnData as generateOpReturnDataCore,
  getAddressBalance as getAddressBalanceCore,
  submitTransaction as submitTransactionCore,
} from '@rosen-ui/xdefi-wallet-next/dist/src/transaction/utils.server';

export const generateOpReturnData = generateOpReturnDataCore;
export const generateUnsignedTx = generateUnsignedTxCore;
export const getAddressBalance = getAddressBalanceCore;
export const submitTransaction = submitTransactionCore;
