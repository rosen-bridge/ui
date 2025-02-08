import { EthereumNetwork } from '@rosen-network/ethereum/dist/client';

import { unwrap } from '@/_safeServerAction';

import { LOCK_ADDRESSES } from '../../../configs';
import { getMaxTransfer } from './server';

export const ethereumNetwork = new EthereumNetwork({
  lockAddress: LOCK_ADDRESSES.ETHEREUM,
  nextHeightInterval: 50,
  getMaxTransfer: unwrap(getMaxTransfer),
});
