import { DogeNetwork } from '@rosen-network/doge/dist/client';

import { unwrapFromObject } from '@/_safeServerAction';

import { LOCK_ADDRESSES } from '../../../configs';
import * as actions from './server';

export const doge = new DogeNetwork({
  lockAddress: LOCK_ADDRESSES.doge,
  nextHeightInterval: 10,
  ...unwrapFromObject(actions),
});
