import { nautilusWalletCreator } from '@rosen-ui/nautilus-wallet';

import { NETWORK_LABELS, NETWORKS } from '@rosen-ui/constants';

import { unwrap } from '@/_safeServerAction';
import { ErgoNetwork as ErgoNetworkType } from '@/_types/network';
import { ErgoIcon } from '@rosen-bridge/icons';

import { generateUnsignedTx } from './server';
import { getTokenMap } from '../getTokenMap.client';
import { getMaxTransfer } from './getMaxTransfer';

const config = {
  getTokenMap,
  generateUnsignedTx: unwrap(generateUnsignedTx),
};

/**
 * the main object for Ergo network
 * providing access to network info and wallets and network specific
 * functionality
 */
const ErgoNetwork: ErgoNetworkType = {
  name: NETWORKS.ERGO,
  label: NETWORK_LABELS.ERGO,
  wallets: [nautilusWalletCreator(config)],
  logo: ErgoIcon,
  nextHeightInterval: 5,
  lockAddress: process.env.NEXT_PUBLIC_ERGO_LOCK_ADDRESS!,
  getMaxTransfer: unwrap(getMaxTransfer),
  toSafeAddress: (address) => address,
};

export default ErgoNetwork;
