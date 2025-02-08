import { OKXWallet } from '@rosen-ui/okx-wallet';

import { unwrap } from '@/_safeServerAction';
import { getTokenMap } from '@/_tokenMap/getClientTokenMap';

import {
  generateOpReturnData,
  generateUnsignedTx,
  submitTransaction,
  getAddressBalance,
} from './server';

export const okx = new OKXWallet({
  getTokenMap,
  generateOpReturnData: unwrap(generateOpReturnData),
  generateUnsignedTx: unwrap(generateUnsignedTx),
  getAddressBalance: unwrap(getAddressBalance),
  submitTransaction: unwrap(submitTransaction),
});
