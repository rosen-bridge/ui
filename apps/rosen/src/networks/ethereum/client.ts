import { EthereumNetwork } from '@rosen-network/ethereum/dist/client';

import { unwrapFromObject } from '@/safeServerAction';

import { LOCK_ADDRESSES } from '../../../configs';
import * as actions from './server';

export const ethereum = new EthereumNetwork({
  lockAddress: LOCK_ADDRESSES.ethereum,
  nextHeightInterval: 50,
  ...unwrapFromObject(actions),
});
