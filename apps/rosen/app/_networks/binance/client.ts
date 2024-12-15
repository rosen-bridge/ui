import { BinanceIcon } from '@rosen-bridge/icons';
import { NETWORK_LABELS, NETWORKS } from '@rosen-ui/constants';
import { MetaMaskWallet } from '@rosen-ui/metamask-wallet';

import { unwrap } from '@/_safeServerAction';
import { getTokenMap } from '@/_tokenMap/getClientTokenMap';
import { BinanceNetwork as BinanceNetworkType } from '@/_types';

import { getMaxTransfer } from './getMaxTransfer';
import { generateLockData, generateTxParameters } from './server';

/**
 * the main object for Binance network
 * providing access to network info and wallets and network specific
 * functionality
 */
export const BinanceNetwork: BinanceNetworkType = {
  name: NETWORKS.BINANCE,
  label: NETWORK_LABELS.BINANCE,
  wallets: [
    new MetaMaskWallet({
      getTokenMap,
      generateLockData: unwrap(generateLockData),
      generateTxParameters: unwrap(generateTxParameters),
    }),
  ],
  nextHeightInterval: 200,
  logo: BinanceIcon,
  lockAddress: process.env.NEXT_PUBLIC_BINANCE_LOCK_ADDRESS!,
  getMaxTransfer: unwrap(getMaxTransfer),
  toSafeAddress: (address) => address,
};
