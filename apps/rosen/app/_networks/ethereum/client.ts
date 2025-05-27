import { EthereumNetwork } from '@rosen-network/ethereum/dist/client';

import { unwrap } from '@/_safeServerAction';

import { LOCK_ADDRESSES } from '../../../configs';
import {
  generateLockData,
  generateTxParameters,
  getMaxTransfer,
} from './server';

export const ethereum = new EthereumNetwork({
  lockAddress: LOCK_ADDRESSES.ethereum,
  nextHeightInterval: 50,
  generateLockData: unwrap(generateLockData),
  generateTxParameters: unwrap(generateTxParameters),
  getMaxTransfer: unwrap(getMaxTransfer),
});
