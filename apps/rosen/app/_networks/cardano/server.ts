'use server';

import { generateUnsignedTx as generateUnsignedTxEternlCore } from '@rosen-ui/eternl-wallet/dist/src/generateUnsignedTx';
import {
  decodeWasmValue as decodeWasmValueEternlCore,
  generateLockAuxiliaryData as generateLockAuxiliaryDataEternlCore,
  setTxWitnessSet as setTxWitnessSetEternlCore,
} from '@rosen-ui/eternl-wallet/dist/src/utils';

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

export const decodeWasmValueEternl = decodeWasmValueEternlCore;
export const generateLockAuxiliaryDataEternl =
  generateLockAuxiliaryDataEternlCore;
export const generateUnsignedTxEternl = generateUnsignedTxEternlCore;
export const setTxWitnessSetEternl = setTxWitnessSetEternlCore;
