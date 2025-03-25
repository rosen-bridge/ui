import { BinanceNetwork } from '@rosen-network/binance/dist/client';

import { unwrap } from '@/_safeServerAction';

import { LOCK_ADDRESSES } from '../../../configs';
import { getMaxTransfer } from './server';

export const binance = new BinanceNetwork({
  lockAddress: LOCK_ADDRESSES.binance,
  nextHeightInterval: 200,
  getMaxTransfer: unwrap(getMaxTransfer),
});
