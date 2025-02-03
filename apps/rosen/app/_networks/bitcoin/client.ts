import { BitcoinNetwork } from '@rosen-network/bitcoin/dist/src/client';

import { unwrap } from '@/_safeServerAction';

import { LOCK_ADDRESSES } from '../../../configs';
import { getMaxTransfer } from './server';

export const bitcoinNetwork = new BitcoinNetwork({
  lockAddress: LOCK_ADDRESSES.BITCOIN,
  nextHeightInterval: 1,
  getMaxTransfer: unwrap(getMaxTransfer),
});
