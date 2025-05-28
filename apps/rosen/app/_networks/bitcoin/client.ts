import { BitcoinNetwork } from '@rosen-network/bitcoin/dist/client';

import { unwrap } from '@/_safeServerAction';

import { LOCK_ADDRESSES } from '../../../configs';
import {
  generateOpReturnData,
  generateUnsignedTx,
  getAddressBalance,
  getMaxTransfer,
  submitTransaction,
} from './server';

export const bitcoin = new BitcoinNetwork({
  lockAddress: LOCK_ADDRESSES.bitcoin,
  nextHeightInterval: 1,
  generateOpReturnData: unwrap(generateOpReturnData),
  generateUnsignedTx: unwrap(generateUnsignedTx),
  getAddressBalance: unwrap(getAddressBalance),
  getMaxTransfer: unwrap(getMaxTransfer),
  submitTransaction: unwrap(submitTransaction),
});
