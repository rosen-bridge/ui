import { metaMaskWalletCreator } from '@rosen-ui/metamask-wallet';

import { NETWORK_LABELS, NETWORKS } from '@rosen-ui/constants';

import { unwrap } from '@/_errors';
import { EthereumNetwork as EthereumNetworkType } from '@/_types/network';
import { EthereumIcon } from '@rosen-bridge/icons';

import { getMaxTransfer } from './getMaxTransfer';
import { fromSafeData } from '@/_utils/safeData';
import { getTokenMap } from '../getTokenMap.client';
import { generateLockData, generateTxParameters } from './server';

/**
 * the main object for Ethereum network
 * providing access to network info and wallets and network specific
 * functionality
 */
const EthereumNetwork: EthereumNetworkType = {
  name: NETWORKS.ETHEREUM,
  label: NETWORK_LABELS.ETHEREUM,
  wallets: [
    metaMaskWalletCreator({
      getTokenMap,
      generateLockData: unwrap(generateLockData),
      generateTxParameters: unwrap(fromSafeData(generateTxParameters)),
    }),
  ],
  logo: EthereumIcon,
  nextHeightInterval: 0,
  lockAddress: process.env.NEXT_PUBLIC_ETHEREUM_LOCK_ADDRESS!,
  getMaxTransfer: unwrap(fromSafeData(getMaxTransfer)),
  toSafeAddress: (address) => address.toLowerCase(),
};

export default EthereumNetwork;
