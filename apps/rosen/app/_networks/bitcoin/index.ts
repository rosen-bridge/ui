import { BitcoinIcon } from '@rosen-bridge/icons';
import { xdefiWalletCreator, xdefiWalletInfo } from '@rosen-ui/xdefi-wallet';

import { compact } from 'lodash-es';

import getMaxTransfer from './getMaxTransfer';

import { Networks } from '@rosen-ui/constants';

import { BitcoinNetwork as BitcoinNetworkType } from '@/_types/network';

import {
  generateOpReturnData,
  generateUnsignedTx,
  submitTransaction,
  getAddressBalance,
} from './server';
import { tokenMap } from '../tokenMap';

/**
 * the main object for Bitcoin network
 * providing access to network info and wallets and network specific
 * functionality
 */
const BitcoinNetwork: BitcoinNetworkType = {
  name: Networks.BITCOIN,
  label: 'Bitcoin',
  logo: BitcoinIcon,
  supportedWallets: [xdefiWalletInfo],
  availableWallets: compact([
    xdefiWalletCreator({
      generateOpReturnData,
      generateUnsignedTx,
      getAddressBalance: getAddressBalance(tokenMap),
      submitTransaction,
    }),
  ]),
  nextHeightInterval: 1,
  lockAddress: process.env.NEXT_PUBLIC_BITCOIN_LOCK_ADDRESS!,
  getMaxTransfer,
};

export default BitcoinNetwork;
