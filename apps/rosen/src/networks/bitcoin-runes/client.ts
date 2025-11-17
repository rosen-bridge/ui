import { BitcoinRunesNetwork } from '@rosen-network/bitcoin-runes/dist/client';
import { NETWORKS } from '@rosen-ui/constants';

import { unwrapFromObject } from '@/safeServerAction';

import { LOCK_ADDRESSES } from '../../../configs';
import * as actions from './server';

export const bitcoinRunes = new BitcoinRunesNetwork({
  lockAddress: LOCK_ADDRESSES[NETWORKS['bitcoin-runes'].key],
  nextHeightInterval: 1,
  ...unwrapFromObject(actions),
});
