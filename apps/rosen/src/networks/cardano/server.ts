'use server';

import { validateAddress as validateAddressCore } from '@rosen-network/base';
import {
  calculateFee as calculateFeeCore,
  decodeWasmValue as decodeWasmValueCore,
  generateLockTx as generateLockTxCore,
  getMaxTransferCreator as getMaxTransferCore,
  getMinTransferCreator,
  setTxWitnessSet as setTxWitnessSetCore,
} from '@rosen-network/cardano';

import { wrap } from '@/safeServerAction';
import { getTokenMap } from '@/tokenMap/getServerTokenMap';

export const calculateFee = wrap(calculateFeeCore, {
  cache: 10 * 60 * 1000,
  traceKey: 'cardano:calculateFee',
});

export const decodeWasmValue = wrap(decodeWasmValueCore, {
  cache: Infinity,
  traceKey: 'cardano:decodeWasmValue',
});

export const generateLockTx = wrap(generateLockTxCore(getTokenMap), {
  traceKey: 'cardano:generateLockTx',
});

export const getMaxTransfer = wrap(getMaxTransferCore(getTokenMap), {
  traceKey: 'cardano:getMaxTransfer',
});

export const getMinTransfer = wrap(getMinTransferCreator(getTokenMap), {
  traceKey: 'cardano:getMinTransfer',
});

export const setTxWitnessSet = wrap(setTxWitnessSetCore, {
  traceKey: 'cardano:setTxWitnessSet',
});

export const validateAddress = wrap(validateAddressCore, {
  cache: Infinity,
  traceKey: 'cardano:validateAddress',
});
