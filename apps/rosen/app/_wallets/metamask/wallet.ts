import { MetaMaskWallet } from '@rosen-ui/metamask-wallet';

import { unwrap } from '@/_safeServerAction';
import { getTokenMap } from '@/_tokenMap/getClientTokenMap';

import { generateLockData, generateTxParameters } from './server';

export const metamask = new MetaMaskWallet({
  getTokenMap,
  generateLockData: unwrap(generateLockData),
  generateTxParameters: unwrap(generateTxParameters),
});
