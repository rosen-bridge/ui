'use server';

import {
  generateOpReturnData as bitcoinGenerateOpReturnData,
  generateUnsignedTx as bitcoinGenerateUnsignedTx,
  getAddressBalance as bitcoinGetAddressBalance,
  submitTransaction as bitcoinSubmitTransaction,
} from '@rosen-network/bitcoin';
import {
  generateOpReturnData as dogeGenerateOpReturnData,
  generateUnsignedTx as dogeGenerateUnsignedTx,
  getAddressBalance as dogeGetAddressBalance,
  submitTransaction as dogeSubmitTransaction,
} from '@rosen-network/doge';

import { wrap } from '@/_safeServerAction';
import { getTokenMap } from '@/_tokenMap/getServerTokenMap';

// Bitcoin functions
export const generateBitcoinOpReturnData = wrap(bitcoinGenerateOpReturnData, {
  traceKey: 'generateBitcoinOpReturnData',
});

export const generateBitcoinUnsignedTx = wrap(
  bitcoinGenerateUnsignedTx(getTokenMap),
  {
    traceKey: 'generateBitcoinUnsignedTx',
  },
);

export const getBitcoinAddressBalance = wrap(bitcoinGetAddressBalance, {
  cache: 3000,
  traceKey: 'getBitcoinAddressBalance',
});

export const submitBitcoinTransaction = wrap(bitcoinSubmitTransaction, {
  traceKey: 'submitBitcoinTransaction',
});

// Dogecoin functions
export const generateDogeOpReturnData = wrap(dogeGenerateOpReturnData, {
  traceKey: 'generateDogeOpReturnData',
});

export const generateDogeUnsignedTx = wrap(
  dogeGenerateUnsignedTx(getTokenMap),
  {
    traceKey: 'generateDogeUnsignedTx',
  },
);

export const getDogeAddressBalance = wrap(dogeGetAddressBalance, {
  cache: 3000,
  traceKey: 'getDogeAddressBalance',
});

export const submitDogeTransaction = wrap(dogeSubmitTransaction, {
  traceKey: 'submitDogeTransaction',
});
