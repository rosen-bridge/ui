import { EthereumIcon } from '@rosen-bridge/icons';
import { NETWORK_LABELS, NETWORKS } from '@rosen-ui/constants';
import { metaMaskWalletCreator } from '@rosen-ui/metamask-wallet';

import { unwrap } from '@/_safeServerAction';
import { EthereumNetwork as EthereumNetworkType } from '@/_types/network';

import { getTokenMap } from '../getTokenMap.client';
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
    metaMaskWalletCreator({
      getTokenMap,
      generateLockData: unwrap(generateLockData),
      generateTxParameters: unwrap(generateTxParameters),
    }),
  ],
  logo: EthereumIcon,
  nextHeightInterval: 0,
  lockAddress: process.env.NEXT_PUBLIC_ETHEREUM_LOCK_ADDRESS!,
  getMaxTransfer: unwrap(getMaxTransfer),
  toSafeAddress: (address) => address.toLowerCase(),
};
