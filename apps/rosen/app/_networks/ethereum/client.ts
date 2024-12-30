import { EthereumIcon } from '@rosen-bridge/icons';
import { NETWORK_LABELS, NETWORKS } from '@rosen-ui/constants';
import { MetaMaskWallet } from '@rosen-ui/metamask-wallet';

import { unwrap } from '@/_safeServerAction';
import { getTokenMap } from '@/_tokenMap/getClientTokenMap';
import { EthereumNetwork as EthereumNetworkType } from '@/_types';

import { LOCK_ADDRESSES } from '../../../configs';
import { getMaxTransfer } from './getMaxTransfer';
import { generateLockData, generateTxParameters } from './server';

/**
 * the main object for Ethereum network
 * providing access to network info and wallets and network specific
 * functionality
 */
export const EthereumNetwork: EthereumNetworkType = {
  name: NETWORKS.ETHEREUM,
  label: NETWORK_LABELS.ETHEREUM,
  wallets: [
    new MetaMaskWallet({
      getTokenMap,
      generateLockData: unwrap(generateLockData),
      generateTxParameters: unwrap(generateTxParameters),
    }),
  ],
  logo: EthereumIcon,
  nextHeightInterval: 0,
  lockAddress: LOCK_ADDRESSES.ETHEREUM,
  getMaxTransfer: unwrap(getMaxTransfer),
  toSafeAddress: (address) => address.toLowerCase(),
};
