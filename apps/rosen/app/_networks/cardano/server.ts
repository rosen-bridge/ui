'use server';

import {
  decodeWasmValue as decodeWasmValueCore,
  generateLockAuxiliaryData as generateLockAuxiliaryDataCore,
  generateUnsignedTx as generateUnsignedTxCore,
  setTxWitnessSet as setTxWitnessSetCore,
} from '@rosen-network/cardano';

import { wrap } from '@/_errors';

export const decodeWasmValue = wrap(decodeWasmValueCore);
export const generateLockAuxiliaryData = wrap(generateLockAuxiliaryDataCore);
export const generateUnsignedTx = wrap(generateUnsignedTxCore);
export const setTxWitnessSet = wrap(setTxWitnessSetCore);
