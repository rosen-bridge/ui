import { ErgoIcon } from '@rosen-bridge/icons';
import { NETWORK_LABELS, NETWORKS } from '@rosen-ui/constants';

import { unwrap } from '@/_safeServerAction';
import { ErgoNetwork as ErgoNetworkType } from '@/_types';

import { LOCK_ADDRESSES } from '../../../configs';
import { getMaxTransfer } from './getMaxTransfer';

/**
 * the main object for Ergo network
 * providing access to network info and wallets and network specific
 * functionality
 */
export const ErgoNetwork: ErgoNetworkType = {
  name: NETWORKS.ERGO,
  label: NETWORK_LABELS.ERGO,
  logo: ErgoIcon,
  nextHeightInterval: 5,
  lockAddress: LOCK_ADDRESSES.ERGO,
  getMaxTransfer: unwrap(getMaxTransfer),
  toSafeAddress: (address) => address,
};
