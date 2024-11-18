import { ErgoIcon } from '@rosen-bridge/icons';
import { NETWORK_LABELS, NETWORKS } from '@rosen-ui/constants';
import { nautilusWalletCreator } from '@rosen-ui/nautilus-wallet';

import { unwrap } from '@/_safeServerAction';
import { getTokenMap } from '@/_tokenMap/getClientTokenMap';
import { ErgoNetwork as ErgoNetworkType } from '@/_types';

import { getMaxTransfer } from './getMaxTransfer';
import { generateUnsignedTx } from './server';

const config = {
  getTokenMap,
  generateUnsignedTx: unwrap(generateUnsignedTx),
};

/**
 * the main object for Ergo network
 * providing access to network info and wallets and network specific
 * functionality
 */
export const ErgoNetwork: ErgoNetworkType = {
  name: NETWORKS.ERGO,
  label: NETWORK_LABELS.ERGO,
  wallets: [nautilusWalletCreator(config)],
  logo: ErgoIcon,
  nextHeightInterval: 5,
  lockAddress: process.env.NEXT_PUBLIC_ERGO_LOCK_ADDRESS!,
  getMaxTransfer: unwrap(getMaxTransfer),
  toSafeAddress: (address) => address,
};
