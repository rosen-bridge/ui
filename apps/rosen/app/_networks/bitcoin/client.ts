import { BitcoinNetwork } from '@rosen-network/bitcoin/dist/client';

import { unwrapFromObject } from '@/_safeServerAction';

import { LOCK_ADDRESSES } from '../../../configs';
import * as actions from './server';

export const bitcoin = new BitcoinNetwork({
  lockAddress: LOCK_ADDRESSES.bitcoin,
  nextHeightInterval: 1,
  ...unwrapFromObject(actions),
});
