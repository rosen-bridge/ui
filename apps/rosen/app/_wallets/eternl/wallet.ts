import { EtrnlWallet } from '@rosen-ui/eternl-wallet';

import { unwrap } from '@/_safeServerAction';
import { getTokenMap } from '@/_tokenMap/getClientTokenMap';

import {
  decodeWasmValue,
  generateLockAuxiliaryData,
  generateUnsignedTx,
  setTxWitnessSet,
} from './server';

export const eternl = new EtrnlWallet({
  getTokenMap,
  decodeWasmValue: unwrap(decodeWasmValue),
  generateLockAuxiliaryData: unwrap(generateLockAuxiliaryData),
  generateUnsignedTx: unwrap(generateUnsignedTx),
  setTxWitnessSet: unwrap(setTxWitnessSet),
});
