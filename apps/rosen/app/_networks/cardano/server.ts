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

import { generateUnsignedTx as generateUnsignedTxLaceCore } from '@rosen-ui/lace-wallet/dist/src/generateUnsignedTx';
import {
  decodeWasmValue as decodeWasmValueLaceCore,
  generateLockAuxiliaryData as generateLockAuxiliaryDataLaceCore,
  setTxWitnessSet as setTxWitnessSetLaceCore,
} from '@rosen-ui/lace-wallet/dist/src/utils';

import { generateUnsignedTx as generateUnsignedTxNamiCore } from '@rosen-ui/nami-wallet/dist/src/generateUnsignedTx';
import {
  decodeWasmValue as decodeWasmValueNamiCore,
  generateLockAuxiliaryData as generateLockAuxiliaryDataNamiCore,
  setTxWitnessSet as setTxWitnessSetNamiCore,
} from '@rosen-ui/nami-wallet/dist/src/utils';

export const decodeWasmValueEternl = decodeWasmValueEternlCore;
export const generateLockAuxiliaryDataEternl =
  generateLockAuxiliaryDataEternlCore;
export const generateUnsignedTxEternl = generateUnsignedTxEternlCore;
export const setTxWitnessSetEternl = setTxWitnessSetEternlCore;

export const decodeWasmValueFlint = decodeWasmValueFlintCore;
export const generateLockAuxiliaryDataFlint =
  generateLockAuxiliaryDataFlintCore;
export const generateUnsignedTxFlint = generateUnsignedTxFlintCore;
export const setTxWitnessSetFlint = setTxWitnessSetFlintCore;

export const decodeWasmValueLace = decodeWasmValueLaceCore;
export const generateLockAuxiliaryDataLace = generateLockAuxiliaryDataLaceCore;
export const generateUnsignedTxLace = generateUnsignedTxLaceCore;
export const setTxWitnessSetLace = setTxWitnessSetLaceCore;

export const decodeWasmValueNami = decodeWasmValueNamiCore;
export const generateLockAuxiliaryDataNami = generateLockAuxiliaryDataNamiCore;
export const generateUnsignedTxNami = generateUnsignedTxNamiCore;
export const setTxWitnessSetNami = setTxWitnessSetNamiCore;
