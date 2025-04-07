import { NETWORKS } from '@rosen-ui/constants';
import { OKXWallet } from '@rosen-ui/okx-wallet';

import { unwrap } from '@/_safeServerAction';
import { getTokenMap } from '@/_tokenMap/getClientTokenMap';

import {
  generateBitcoinOpReturnData,
  generateBitcoinUnsignedTx,
  submitBitcoinTransaction,
  getBitcoinAddressBalance,
  generateDogeOpReturnData,
  generateDogeUnsignedTx,
  getDogeAddressBalance,
  submitDogeTransaction,
} from './server';

export const okx = new OKXWallet({
  [NETWORKS.bitcoin.key]: {
    getTokenMap,
    generateOpReturnData: unwrap(generateBitcoinOpReturnData),
    generateUnsignedTx: unwrap(generateBitcoinUnsignedTx),
    getAddressBalance: unwrap(getBitcoinAddressBalance),
    submitTransaction: unwrap(submitBitcoinTransaction),
  },
  [NETWORKS.doge.key]: {
    getTokenMap,
    generateOpReturnData: unwrap(generateDogeOpReturnData),
    generateUnsignedTx: unwrap(generateDogeUnsignedTx),
    getAddressBalance: unwrap(getDogeAddressBalance),
    submitTransaction: unwrap(submitDogeTransaction),
  },
});
