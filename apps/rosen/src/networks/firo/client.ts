import { FiroNetwork } from '@rosen-network/firo/dist/client';

import { unwrapFromObject } from '@/safeServerAction';

import { LOCK_ADDRESSES } from '../../../configs';
import * as actions from './server';

export const firo = new FiroNetwork({
  lockAddress: LOCK_ADDRESSES.firo,
  nextHeightInterval: 10,
  ...unwrapFromObject(actions),
});
