import { EthereumIcon } from '@rosen-bridge/icons';
import { NETWORK_LABELS, NETWORKS } from '@rosen-ui/constants';

import { unwrap } from '@/_safeServerAction';
import { EthereumNetwork as EthereumNetworkType } from '@/_types';

import { LOCK_ADDRESSES } from '../../../configs';
import { getMaxTransfer } from './getMaxTransfer';

/**
 * the main object for Ethereum network
 * providing access to network info and wallets and network specific
 * functionality
 */
export const EthereumNetwork: EthereumNetworkType = {
  name: NETWORKS.ETHEREUM,
  label: NETWORK_LABELS.ETHEREUM,
  logo: EthereumIcon,
  nextHeightInterval: 50,
  lockAddress: LOCK_ADDRESSES.ETHEREUM,
  getMaxTransfer: unwrap(getMaxTransfer),
  toSafeAddress: (address) => address.toLowerCase(),
};
