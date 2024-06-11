import { BitcoinIcon } from '@rosen-bridge/icons';
import { xdefiWalletCreator, xdefiWalletInfo } from '@rosen-ui/xdefi-wallet';

import { compact } from 'lodash-es';

import getMaxTransferableAmount from './getMaxTransferableAmount';

import { Networks } from '@/_constants';

import { BitcoinNetwork as BitcoinNetworkType } from '@/_types/network';

import {
  generateOpReturnData,
  generateUnsignedTx,
  submitTransaction,
  getAddressBalance,
} from './server';

/**
 * the main object for Bitcoin network
 * providing access to network info and wallets and network specific
 * functionality
 */
const BitcoinNetwork: BitcoinNetworkType = {
  name: Networks.bitcoin,
  label: 'Bitcoin',
  logo: BitcoinIcon,
  supportedWallets: [xdefiWalletInfo],
  availableWallets: compact([
    xdefiWalletCreator({
      generateOpReturnData,
      generateUnsignedTx,
      submitTransaction,
      getAddressBalance,
    }),
  ]),
  nextHeightInterval: 1,
  lockAddress: process.env.NEXT_PUBLIC_BITCOIN_LOCK_ADDRESS!,
  getMaxTransferableAmount,
};

export default BitcoinNetwork;
