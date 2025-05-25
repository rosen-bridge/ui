import { WalletConnectBitcoin } from '@rosen-ui/wallet-connect';

import { unwrap } from '@/_safeServerAction';
import { getTokenMap } from '@/_tokenMap/getClientTokenMap';

import {
  generateOpReturnData,
  generateUnsignedTx,
  submitTransaction,
  getAddressBalance,
} from './server';

export const walletConnectBitcoin = new WalletConnectBitcoin({
  projectId: 'a95ba285168bef3d2e4fc7e6be193998',
  getTokenMap,
  generateOpReturnData: unwrap(generateOpReturnData),
  generateUnsignedTx: unwrap(generateUnsignedTx),
  getAddressBalance: unwrap(getAddressBalance),
  submitTransaction: unwrap(submitTransaction),
});
