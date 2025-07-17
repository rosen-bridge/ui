'use server';

import {
  decodeWasmValue as decodeWasmValueCore,
  generateLockAuxiliaryData as generateLockAuxiliaryDataCore,
  generateUnsignedTx as generateUnsignedTxCore,
  getMaxTransferCreator as getMaxTransferCore,
  setTxWitnessSet as setTxWitnessSetCore,
} from '@rosen-network/cardano';

import { wrap } from '@/safeServerAction';
import { getTokenMap } from '@/tokenMap/getServerTokenMap';

export const decodeWasmValue = wrap(decodeWasmValueCore, {
  cache: Infinity,
  traceKey: 'cardano:decodeWasmValue',
});

export const generateLockAuxiliaryData = wrap(generateLockAuxiliaryDataCore, {
  traceKey: 'cardano:generateLockAuxiliaryData',
});

export const generateUnsignedTx = wrap(generateUnsignedTxCore(getTokenMap), {
  traceKey: 'cardano:generateUnsignedTx',
});

export const getMaxTransfer = wrap(getMaxTransferCore(getTokenMap), {
  traceKey: 'cardano:getMaxTransfer',
});

export const setTxWitnessSet = wrap(setTxWitnessSetCore, {
  traceKey: 'cardano:setTxWitnessSet',
});
