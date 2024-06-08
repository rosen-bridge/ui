'use server';

import { generateUnsignedTx as generateUnsignedTxFlintCore } from '@rosen-ui/flint-wallet/dist/src/generateUnsignedTx';

import {
  decodeWasmValue as decodeWasmValueFlintCore,
  generateLockAuxiliaryData as generateLockAuxiliaryDataFlintCore,
  setTxWitnessSet as setTxWitnessSetFlintCore,
} from '@rosen-ui/flint-wallet/dist/src/utils';

export const decodeWasmValueFlint = decodeWasmValueFlintCore;
export const generateLockAuxiliaryDataFlint =
  generateLockAuxiliaryDataFlintCore;
export const generateUnsignedTxFlint = generateUnsignedTxFlintCore;
export const setTxWitnessSetFlint = setTxWitnessSetFlintCore;
