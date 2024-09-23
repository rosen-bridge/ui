import { nautilusWalletCreator } from '@rosen-ui/nautilus-wallet';

import { Networks } from '@rosen-ui/constants';

import { unwrap } from '@/_errors';
import { ErgoNetwork as ErgoNetworkType } from '@/_types/network';
import { ErgoIcon } from '@rosen-bridge/icons';

import { generateUnsignedTx } from './server';
import { getTokenMap } from '../getTokenMap.client';
import { getMaxTransfer } from './getMaxTransfer';
import { fromSafeData } from '@/_utils/safeData';

const config = {
  getTokenMap,
  generateUnsignedTx: unwrap(fromSafeData(generateUnsignedTx)),
};

/**
 * the main object for Ergo network
 * providing access to network info and wallets and network specific
 * functionality
 */
const ErgoNetwork: ErgoNetworkType = {
  name: Networks.ERGO,
  label: 'Ergo',
  wallets: [nautilusWalletCreator(config)],
  logo: ErgoIcon,
  nextHeightInterval: 5,
  lockAddress: process.env.NEXT_PUBLIC_ERGO_LOCK_ADDRESS!,
  getMaxTransfer: unwrap(fromSafeData(getMaxTransfer)),
  toSafeAddress: (address) => address,
};

export default ErgoNetwork;
