import { NamiWallet } from '@rosen-ui/nami-wallet';

import { unwrap } from '@/_safeServerAction';
import { getTokenMap } from '@/_tokenMap/getClientTokenMap';

import {
  decodeWasmValue,
  generateLockAuxiliaryData,
  generateUnsignedTx,
  setTxWitnessSet,
} from './server';

export const nami = new NamiWallet({
  getTokenMap,
  decodeWasmValue: unwrap(decodeWasmValue),
  generateLockAuxiliaryData: unwrap(generateLockAuxiliaryData),
  generateUnsignedTx: unwrap(generateUnsignedTx),
  setTxWitnessSet: unwrap(setTxWitnessSet),
});
