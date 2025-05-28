import { WalletConnectBinance } from '@rosen-ui/wallet-connect';

import { unwrap } from '@/_safeServerAction';
import { getTokenMap } from '@/_tokenMap/getClientTokenMap';

import { generateLockData, generateTxParameters } from './server';

export const walletConnectBinance = new WalletConnectBinance({
  projectId: process.env.NEXT_PUBLIC_REOWN_PROJECT_ID!,
  getTokenMap,
  generateLockData: unwrap(generateLockData),
  generateTxParameters: unwrap(generateTxParameters),
});
