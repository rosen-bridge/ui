import { ErgoNetwork } from '@rosen-network/ergo/dist/src/client';

import { unwrap } from '@/_safeServerAction';

import { LOCK_ADDRESSES } from '../../../configs';
import { getMaxTransfer } from './server';

export const ergoNetwork = new ErgoNetwork({
  lockAddress: LOCK_ADDRESSES.ERGO,
  nextHeightInterval: 5,
  getMaxTransfer: unwrap(getMaxTransfer),
});
