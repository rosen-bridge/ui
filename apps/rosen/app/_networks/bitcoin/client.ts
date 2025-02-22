import { BitcoinNetwork } from '@rosen-network/bitcoin/dist/client';

import { unwrap } from '@/_safeServerAction';

import { LOCK_ADDRESSES } from '../../../configs';
import { getMaxTransfer } from './server';

export const bitcoinNetwork = new BitcoinNetwork({
  lockAddress: LOCK_ADDRESSES.bitcoin,
  nextHeightInterval: 1,
  getMaxTransfer: unwrap(getMaxTransfer),
});
