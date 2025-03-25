import { EthereumNetwork } from '@rosen-network/ethereum/dist/client';

import { unwrap } from '@/_safeServerAction';

import { LOCK_ADDRESSES } from '../../../configs';
import { getMaxTransfer } from './server';

export const ethereum = new EthereumNetwork({
  lockAddress: LOCK_ADDRESSES.ethereum,
  nextHeightInterval: 50,
  getMaxTransfer: unwrap(getMaxTransfer),
});
