'use server';

import { generateUnsignedTx as generateUnsignedTxLaceCore } from '@rosen-ui/lace-wallet/dist/src/generateUnsignedTx';

import {
  decodeWasmValue as decodeWasmValueLaceCore,
  generateLockAuxiliaryData as generateLockAuxiliaryDataLaceCore,
  setTxWitnessSet as setTxWitnessSetLaceCore,
} from '@rosen-ui/lace-wallet/dist/src/utils';

export const decodeWasmValueLace = decodeWasmValueLaceCore;
export const generateLockAuxiliaryDataLace = generateLockAuxiliaryDataLaceCore;
export const generateUnsignedTxLace = generateUnsignedTxLaceCore;
export const setTxWitnessSetLace = setTxWitnessSetLaceCore;
