import { WalletConnectEVM } from '@rosen-ui/wallet-connect';

import { unwrap } from '@/_safeServerAction';
import { getTokenMap } from '@/_tokenMap/getClientTokenMap';

import { generateLockData, generateTxParameters, getBalance } from './server';

export const walletConnectEVM = new WalletConnectEVM({
  projectId: 'a95ba285168bef3d2e4fc7e6be193998',
  getTokenMap,
  generateLockData: unwrap(generateLockData),
  generateTxParameters: unwrap(generateTxParameters),
  getBalance: unwrap(getBalance),
});
