import { LaceWallet } from '@rosen-ui/lace-wallet';

import { unwrap } from '@/_safeServerAction';
import { getTokenMap } from '@/_tokenMap/getClientTokenMap';

import {
  decodeWasmValue,
  generateLockAuxiliaryData,
  generateUnsignedTx,
  setTxWitnessSet,
} from './server';

export const lace = new LaceWallet({
  getTokenMap,
  decodeWasmValue: unwrap(decodeWasmValue),
  generateLockAuxiliaryData: unwrap(generateLockAuxiliaryData),
  generateUnsignedTx: unwrap(generateUnsignedTx),
  setTxWitnessSet: unwrap(setTxWitnessSet),
});
