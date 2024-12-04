import { BitcoinIcon } from '@rosen-bridge/icons';
import { NETWORK_LABELS, NETWORKS } from '@rosen-ui/constants';
import { ctrlWalletCreator } from '@rosen-ui/ctrl-wallet';
import { xdefiWalletCreator } from '@rosen-ui/xdefi-wallet';

import { unwrap } from '@/_safeServerAction';
import { getTokenMap } from '@/_tokenMap/getClientTokenMap';
import { BitcoinNetwork as BitcoinNetworkType } from '@/_types';

import { getMaxTransfer } from './getMaxTransfer';
import {
  generateOpReturnData,
  generateUnsignedTx,
  submitTransaction,
  getAddressBalance,
} from './server';

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
export const BitcoinNetwork: BitcoinNetworkType = {
  name: NETWORKS.BITCOIN,
  label: NETWORK_LABELS.BITCOIN,
  logo: BitcoinIcon,
  wallets: [xdefiWalletCreator(config), ctrlWalletCreator(config)],
  nextHeightInterval: 1,
  lockAddress: process.env.NEXT_PUBLIC_BITCOIN_LOCK_ADDRESS!,
  getMaxTransfer: unwrap(getMaxTransfer),
  toSafeAddress: (address) => address,
};
