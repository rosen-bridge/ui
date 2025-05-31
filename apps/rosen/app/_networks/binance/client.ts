import { BinanceNetwork } from '@rosen-network/binance/dist/client';

import { unwrapFromObject } from '@/_safeServerAction';

import { LOCK_ADDRESSES } from '../../../configs';
import * as actions from './server';

export const binance = new BinanceNetwork({
  lockAddress: LOCK_ADDRESSES.binance,
  nextHeightInterval: 200,
  ...unwrapFromObject(actions),
});
