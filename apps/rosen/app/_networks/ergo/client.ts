import { ErgoNetwork } from '@rosen-network/ergo/dist/client';

import { unwrapFromObject } from '@/_safeServerAction';

import { LOCK_ADDRESSES } from '../../../configs';
import * as actions from './server';

export const ergo = new ErgoNetwork({
  lockAddress: LOCK_ADDRESSES.ergo,
  nextHeightInterval: 5,
  ...unwrapFromObject(actions),
});
