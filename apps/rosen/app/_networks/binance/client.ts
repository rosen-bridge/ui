import { BinanceNetwork } from '@rosen-network/binance/dist/client';

import { unwrap } from '@/_safeServerAction';

import { LOCK_ADDRESSES } from '../../../configs';
import {
  generateLockData,
  generateTxParameters,
  getMaxTransfer,
} from './server';

export const binance = new BinanceNetwork({
  lockAddress: LOCK_ADDRESSES.binance,
  nextHeightInterval: 200,
  generateLockData: unwrap(generateLockData),
  generateTxParameters: unwrap(generateTxParameters),
  getMaxTransfer: unwrap(getMaxTransfer),
});
