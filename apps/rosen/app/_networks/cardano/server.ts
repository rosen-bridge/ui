'use server';

import { generateUnsignedTx as generateUnsignedTxEternlCore } from '@rosen-ui/eternl-wallet/dist/src/generateUnsignedTx';
import {
  decodeWasmValue as decodeWasmValueCore,
  generateLockAuxiliaryData as generateLockAuxiliaryDataEternlCore,
  setTxWitnessSet as setTxWitnessSetEternlCore,
} from '@rosen-ui/eternl-wallet/dist/src/utils';

import { generateUnsignedTx as generateUnsignedTxNamiCore } from '@rosen-ui/nami-wallet/dist/src/generateUnsignedTx';
import {
  decodeWasmValue as decodeWasmValueNamiCore,
  generateLockAuxiliaryData as generateLockAuxiliaryDataNamiCore,
  setTxWitnessSet as setTxWitnessSetNamiCore,
} from '@rosen-ui/nami-wallet/dist/src/utils';

export const decodeWasmValue = decodeWasmValueCore;
export const generateLockAuxiliaryDataEternl =
  generateLockAuxiliaryDataEternlCore;
export const generateUnsignedTxEternl = generateUnsignedTxEternlCore;
export const setTxWitnessSetEternl = setTxWitnessSetEternlCore;

export const decodeWasmValueNami = decodeWasmValueNamiCore;
export const generateLockAuxiliaryDataNami = generateLockAuxiliaryDataNamiCore;
export const generateUnsignedTxNami = generateUnsignedTxNamiCore;
export const setTxWitnessSetNami = setTxWitnessSetNamiCore;
