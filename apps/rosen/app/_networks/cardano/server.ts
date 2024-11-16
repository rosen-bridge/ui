'use server';

import { TokenMap } from '@rosen-bridge/tokens';
import {
  decodeWasmValue as decodeWasmValueCore,
  generateLockAuxiliaryData as generateLockAuxiliaryDataCore,
  generateUnsignedTx as generateUnsignedTxCore,
  setTxWitnessSet as setTxWitnessSetCore,
} from '@rosen-network/cardano';

import { getRosenTokens } from '@/_backend/utils';
import { wrap } from '@/_safeServerAction';

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
