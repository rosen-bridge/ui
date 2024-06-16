'use server';

import {
  decodeWasmValue as decodeWasmValueCore,
  generateLockAuxiliaryData as generateLockAuxiliaryDataCore,
  generateUnsignedTx as generateUnsignedTxCore,
  setTxWitnessSet as setTxWitnessSetCore,
} from '@rosen-network/cardano';

export const decodeWasmValue = decodeWasmValueCore;
export const generateLockAuxiliaryData = generateLockAuxiliaryDataCore;
export const generateUnsignedTx = generateUnsignedTxCore;
export const setTxWitnessSet = setTxWitnessSetCore;
