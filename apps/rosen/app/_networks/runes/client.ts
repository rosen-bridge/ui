import { RunesNetwork } from '@rosen-network/runes/dist/client';

import { unwrap } from '@/_safeServerAction';

import { LOCK_ADDRESSES } from '../../../configs';
import { getMaxTransfer } from './server';

export const runes = new RunesNetwork({
  lockAddress: LOCK_ADDRESSES.runes,
  nextHeightInterval: 1,
  getMaxTransfer: unwrap(getMaxTransfer),
});
