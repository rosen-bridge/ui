import { CardanoIcon } from '@rosen-bridge/icons';
import { NETWORK_LABELS, NETWORKS } from '@rosen-ui/constants';

import { unwrap } from '@/_safeServerAction';
import { CardanoNetwork as CardanoNetworkType } from '@/_types';

import { LOCK_ADDRESSES } from '../../../configs';
import { getMaxTransfer } from './getMaxTransfer';

/**
 * the main object for Cardano network
 * providing access to network info and wallets and network specific
 * functionality
 */
export const CardanoNetwork: CardanoNetworkType = {
  name: NETWORKS.CARDANO,
  label: NETWORK_LABELS.CARDANO,
  nextHeightInterval: 30,
  logo: CardanoIcon,
  lockAddress: LOCK_ADDRESSES.CARDANO,
  getMaxTransfer: unwrap(getMaxTransfer),
  toSafeAddress: (address) => address,
};
