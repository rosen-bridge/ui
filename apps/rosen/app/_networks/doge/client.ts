import { DogeNetwork } from '@rosen-network/doge/dist/client';

import { unwrap } from '@/_safeServerAction';

import { LOCK_ADDRESSES } from '../../../configs';
import { getMaxTransfer } from './server';

export const doge = new DogeNetwork({
  lockAddress: LOCK_ADDRESSES.doge,
  nextHeightInterval: 10,
  getMaxTransfer: unwrap(getMaxTransfer),
});
