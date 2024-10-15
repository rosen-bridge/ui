'use server';

import {
  decodeWasmValue as decodeWasmValueCore,
  generateLockAuxiliaryData as generateLockAuxiliaryDataCore,
  generateUnsignedTx as generateUnsignedTxCore,
  setTxWitnessSet as setTxWitnessSetCore,
} from '@rosen-network/cardano';

import { wrap } from '@/_errors';
import { TokenMap } from '@rosen-bridge/tokens';
import { getRosenTokens } from '@/_backend/utils';
import { toSafeData } from '@/_utils/safeData';

export const decodeWasmValue = wrap(toSafeData(decodeWasmValueCore));
export const generateLockAuxiliaryData = wrap(
  toSafeData(generateLockAuxiliaryDataCore),
);
export const generateUnsignedTx = wrap(
  toSafeData(generateUnsignedTxCore(new TokenMap(getRosenTokens()))),
);
export const setTxWitnessSet = wrap(toSafeData(setTxWitnessSetCore));
