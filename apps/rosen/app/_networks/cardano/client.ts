import { CardanoNetwork } from '@rosen-network/cardano/dist/client';

import { unwrapFromObject } from '@/_safeServerAction';

import { LOCK_ADDRESSES } from '../../../configs';
import * as actions from './server';

export const cardano = new CardanoNetwork({
  lockAddress: LOCK_ADDRESSES.cardano,
  nextHeightInterval: 30,
  ...unwrapFromObject(actions),
});
