import { HandshakeNetwork } from '@rosen-network/handshake/dist/client';

import { unwrapFromObject } from '@/safeServerAction';

import { LOCK_ADDRESSES } from '../../../configs';
import * as actions from './server';

export const handshake = new HandshakeNetwork({
  lockAddress: LOCK_ADDRESSES.handshake,
  nextHeightInterval: 1,
  ...unwrapFromObject(actions),
});
