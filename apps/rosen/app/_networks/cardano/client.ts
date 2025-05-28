import { CardanoNetwork } from '@rosen-network/cardano/dist/client';

import { unwrap } from '@/_safeServerAction';

import { LOCK_ADDRESSES } from '../../../configs';
import {
  decodeWasmValue,
  generateLockAuxiliaryData,
  generateUnsignedTx,
  getMaxTransfer,
  setTxWitnessSet,
} from './server';

export const cardano = new CardanoNetwork({
  lockAddress: LOCK_ADDRESSES.cardano,
  nextHeightInterval: 30,
  decodeWasmValue: unwrap(decodeWasmValue),
  generateLockAuxiliaryData: unwrap(generateLockAuxiliaryData),
  generateUnsignedTx: unwrap(generateUnsignedTx),
  getMaxTransfer: unwrap(getMaxTransfer),
  setTxWitnessSet: unwrap(setTxWitnessSet),
});
