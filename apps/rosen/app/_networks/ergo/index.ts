import { nautilusWalletCreator } from '@rosen-ui/nautilus-wallet';

import { Networks } from '@rosen-ui/constants';

import { unwrap } from '@/_errors';
import { ErgoNetwork as ErgoNetworkType } from '@/_types/network';
import { ErgoIcon } from '@rosen-bridge/icons';

import { generateUnsignedTx } from './server';

import { getMaxTransfer } from './getMaxTransfer';
import { getTokenMap } from '../getTokenMap';

/**
 * the main object for Ergo network
 * providing access to network info and wallets and network specific
 * functionality
 */
const ErgoNetwork: ErgoNetworkType = {
  name: Networks.ERGO,
  label: 'Ergo',
  wallets: [
    nautilusWalletCreator({
      getTokenMap,
      generateUnsignedTx: unwrap(generateUnsignedTx),
    }),
  ],
  logo: ErgoIcon,
  nextHeightInterval: 5,
  lockAddress: process.env.NEXT_PUBLIC_ERGO_LOCK_ADDRESS!,

  // THIS FUNCTION WORKS WITH WRAPPED-VALUE
  getMaxTransfer: unwrap(getMaxTransfer),
};

export default ErgoNetwork;
