import { ErgoNetwork } from '@rosen-network/ergo/dist/client';

import { unwrap } from '@/_safeServerAction';

import { LOCK_ADDRESSES } from '../../../configs';
import { generateUnsignedTx, getMaxTransfer } from './server';

export const ergo = new ErgoNetwork({
  lockAddress: LOCK_ADDRESSES.ergo,
  nextHeightInterval: 5,
  generateUnsignedTx: unwrap(generateUnsignedTx),
  getMaxTransfer: unwrap(getMaxTransfer),
});
