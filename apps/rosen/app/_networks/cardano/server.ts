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

const tokenMap = new TokenMap(getRosenTokens());

export const decodeWasmValue = wrap(decodeWasmValueCore);
export const generateLockAuxiliaryData = wrap(generateLockAuxiliaryDataCore);
export const generateUnsignedTx = wrap(generateUnsignedTxCore(tokenMap));
export const setTxWitnessSet = wrap(setTxWitnessSetCore);
