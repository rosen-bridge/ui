import { xdefiWalletCreator } from '@rosen-ui/xdefi-wallet-next';

import {
  generateOpReturnData,
  generateUnsignedTx,
  getAddressBalance,
  submitTransaction,
} from './server';

/**
 * the main object for Bitcoin network
 * providing access to network info and wallets and network specific
 * functionality
 */
export default xdefiWalletCreator({
  lockAddress: process.env.NEXT_PUBLIC_BITCOIN_LOCK_ADDRESS!,
  generateOpReturnData,
  generateUnsignedTx,
  getAddressBalance,
  submitTransaction,
});
