import { BitcoinIcon } from '@rosen-bridge/icons';
import { NETWORK_LABELS, NETWORKS } from '@rosen-ui/constants';

import { unwrap } from '@/_safeServerAction';
import { BitcoinNetwork as BitcoinNetworkType } from '@/_types';

import { LOCK_ADDRESSES } from '../../../configs';
import { getMaxTransfer } from './server';

/**
 * the main object for Bitcoin network
 * providing access to network info and wallets and network specific
 * functionality
 */
export const BitcoinNetwork: BitcoinNetworkType = {
  name: NETWORKS.BITCOIN,
  label: NETWORK_LABELS.BITCOIN,
  logo: BitcoinIcon,
  nextHeightInterval: 1,
  lockAddress: LOCK_ADDRESSES.BITCOIN,
  getMaxTransfer: unwrap(getMaxTransfer),
  toSafeAddress: (address) => address,
};
