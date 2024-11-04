import { BitcoinIcon } from '@rosen-bridge/icons';
import { xdefiWalletCreator } from '@rosen-ui/xdefi-wallet';

import { getMaxTransfer } from './getMaxTransfer';

import { NETWORK_LABELS, NETWORKS } from '@rosen-ui/constants';

import { unwrap } from '@/_safeServerAction';
import { BitcoinNetwork as BitcoinNetworkType } from '@/_types/network';

import {
  generateOpReturnData,
  generateUnsignedTx,
  submitTransaction,
  getAddressBalance,
} from './server';

import { getTokenMap } from '../getTokenMap.client';

const config = {
  getTokenMap,
  generateOpReturnData: unwrap(generateOpReturnData),
  generateUnsignedTx: unwrap(generateUnsignedTx),
  getAddressBalance: unwrap(getAddressBalance),
  submitTransaction: unwrap(submitTransaction),
};

/**
 * the main object for Bitcoin network
 * providing access to network info and wallets and network specific
 * functionality
 */
const BitcoinNetwork: BitcoinNetworkType = {
  name: NETWORKS.BITCOIN,
  label: NETWORK_LABELS.BITCOIN,
  logo: BitcoinIcon,
  wallets: [xdefiWalletCreator(config)],
  nextHeightInterval: 1,
  lockAddress: process.env.NEXT_PUBLIC_BITCOIN_LOCK_ADDRESS!,
  getMaxTransfer: unwrap(getMaxTransfer),
  toSafeAddress: (address) => address,
};

export default BitcoinNetwork;
