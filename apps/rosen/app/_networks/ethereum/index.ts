import { metaMaskWalletCreator } from '@rosen-ui/metamask-wallet';

import { Networks } from '@rosen-ui/constants';

import { unwrap } from '@/_errors';
import { EthereumNetwork as EthereumNetworkType } from '@/_types/network';
import { EthereumIcon } from '@rosen-bridge/icons';

import {} from './server';
import { getMaxTransfer } from './getMaxTransfer';
import { fromSafeData } from '@/_utils/safeData';
import { getTokenMap } from '../getTokenMap.client';

/**
 * the main object for Ethereum network
 * providing access to network info and wallets and network specific
 * functionality
 */
const EthereumNetwork: EthereumNetworkType = {
  name: Networks.ETHEREUM,
  label: 'Ethereum',
  wallets: [
    metaMaskWalletCreator({
      getTokenMap,
    }),
  ],
  logo: EthereumIcon,
  nextHeightInterval: 0,
  lockAddress: process.env.NEXT_PUBLIC_ETHEREUM_LOCK_ADDRESS!,
  getMaxTransfer: unwrap(fromSafeData(getMaxTransfer)),
};

export default EthereumNetwork;
