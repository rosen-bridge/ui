import { BitcoinRunesNetwork } from '@rosen-network/bitcoin-runes/dist/client';

import { unwrapFromObject } from '@/safeServerAction';

import { LOCK_ADDRESSES } from '../../../configs';
import * as actions from './server';

export const bitcoinRunes = new BitcoinRunesNetwork({
  lockAddress: LOCK_ADDRESSES.bitcoinRunes,
  nextHeightInterval: 1,
  ...unwrapFromObject(actions),
});
