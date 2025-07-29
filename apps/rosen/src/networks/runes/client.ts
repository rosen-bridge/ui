import { RunesNetwork } from '@rosen-network/runes/dist/client';

import { unwrapFromObject } from '@/safeServerAction';

import { LOCK_ADDRESSES } from '../../../configs';
import * as actions from './server';

export const runes = new RunesNetwork({
  lockAddress: LOCK_ADDRESSES.runes,
  nextHeightInterval: 1,
  ...unwrapFromObject(actions),
});
