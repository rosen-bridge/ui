'use server';

import {
  decodeWasmValue as decodeWasmValueCore,
  generateLockAuxiliaryData as generateLockAuxiliaryDataCore,
  generateUnsignedTx as generateUnsignedTxCore,
  setTxWitnessSet as setTxWitnessSetCore,
} from '@rosen-network/cardano';

import { wrap } from '@/_safeServerAction';
import { TokenMap } from '@rosen-bridge/tokens';
import { getRosenTokens } from '@/_backend/utils';

export const decodeWasmValue = wrap(decodeWasmValueCore, {
  cache: Infinity,
  traceKey: 'decodeWasmValue',
});

export const generateLockAuxiliaryData = wrap(generateLockAuxiliaryDataCore, {
  traceKey: 'generateLockAuxiliaryData',
});

export const generateUnsignedTx = wrap(
  generateUnsignedTxCore(new TokenMap(getRosenTokens())),
  {
    traceKey: 'generateUnsignedTx',
  },
);

export const setTxWitnessSet = wrap(setTxWitnessSetCore, {
  traceKey: 'setTxWitnessSet',
});
