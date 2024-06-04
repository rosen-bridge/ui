'use server';

import { generateUnsignedTx as generateUnsignedTxEternlCore } from '@rosen-ui/eternl-wallet/dist/src/generateUnsignedTx';

import {
  generateLockAuxiliaryData as generateLockAuxiliaryDataEternlCore,
  setTxWitnessSet as setTxWitnessSetEternlCore,
} from '@rosen-ui/eternl-wallet/dist/src/utils';

export const generateLockAuxiliaryDataEternl =
  generateLockAuxiliaryDataEternlCore;
export const generateUnsignedTxEternl = generateUnsignedTxEternlCore;
export const setTxWitnessSetEternl = setTxWitnessSetEternlCore;
