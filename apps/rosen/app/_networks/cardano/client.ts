import { CardanoNetwork } from '@rosen-network/cardano/dist/src/client';

import { unwrap } from '@/_safeServerAction';

import { LOCK_ADDRESSES } from '../../../configs';
import { getMaxTransfer } from './server';

export const cardanoNetwork = new CardanoNetwork({
  lockAddress: LOCK_ADDRESSES.CARDANO,
  nextHeightInterval: 30,
  getMaxTransfer: unwrap(getMaxTransfer),
});
