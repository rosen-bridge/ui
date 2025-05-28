import { DogeNetwork } from '@rosen-network/doge/dist/client';

import { unwrap } from '@/_safeServerAction';

import { LOCK_ADDRESSES } from '../../../configs';
import {
  generateOpReturnData,
  generateUnsignedTx,
  getAddressBalance,
  getMaxTransfer,
  submitTransaction,
} from './server';

export const doge = new DogeNetwork({
  lockAddress: LOCK_ADDRESSES.doge,
  nextHeightInterval: 10,
  generateOpReturnData: unwrap(generateOpReturnData),
  generateUnsignedTx: unwrap(generateUnsignedTx),
  getAddressBalance: unwrap(getAddressBalance),
  getMaxTransfer: unwrap(getMaxTransfer),
  submitTransaction: unwrap(submitTransaction),
});
