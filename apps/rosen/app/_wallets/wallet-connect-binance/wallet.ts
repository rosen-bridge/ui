import { WalletConnectBinance } from '@rosen-ui/wallet-connect';

import { unwrap } from '@/_safeServerAction';
import { getTokenMap } from '@/_tokenMap/getClientTokenMap';

import { generateLockData, generateTxParameters } from './server';

export const walletConnectBinance = new WalletConnectBinance({
  projectId: 'a95ba285168bef3d2e4fc7e6be193998',
  getTokenMap,
  generateLockData: unwrap(generateLockData),
  generateTxParameters: unwrap(generateTxParameters),
});
