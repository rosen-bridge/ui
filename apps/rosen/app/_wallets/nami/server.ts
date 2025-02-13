'use server';

import {
  decodeWasmValue as decodeWasmValueCore,
  generateLockAuxiliaryData as generateLockAuxiliaryDataCore,
  generateUnsignedTx as generateUnsignedTxCore,
  setTxWitnessSet as setTxWitnessSetCore,
} from '@rosen-network/cardano';

import { wrap } from '@/_safeServerAction';
import { getTokenMap } from '@/_tokenMap/getServerTokenMap';

export const decodeWasmValue = wrap(decodeWasmValueCore, {
  cache: Infinity,
  traceKey: 'decodeWasmValue',
});

export const generateLockAuxiliaryData = wrap(generateLockAuxiliaryDataCore, {
  traceKey: 'generateLockAuxiliaryData',
});

export const generateUnsignedTx = wrap(generateUnsignedTxCore(getTokenMap), {
  traceKey: 'generateUnsignedTx',
});

export const setTxWitnessSet = wrap(setTxWitnessSetCore, {
  traceKey: 'setTxWitnessSet',
});
