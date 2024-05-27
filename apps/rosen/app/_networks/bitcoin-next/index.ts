import { BitcoinIcon } from '@rosen-bridge/icons';
import {
  isXdefiAvailable,
  xdefiWalletCreator,
  xdefiWalletInfo,
} from '@rosen-ui/xdefi-wallet-next';
import { Wallet } from '@rosen-ui/wallet-api';

import { compact } from 'lodash-es';

import { Networks } from '@/_constants';
import { Network } from '@/_types/network';

import { getBalance, transfer } from './server';

/**
 * the main object for Bitcoin network
 * providing access to network info and wallets and network specific
 * functionality
 */
const BitcoinNetwork: Network<Wallet> = {
  name: Networks.bitcoin,
  label: 'Bitcoin',
  logo: BitcoinIcon,
  supportedWallets: [xdefiWalletInfo],
  availableWallets: compact([
    isXdefiAvailable() && xdefiWalletCreator({ getBalance, transfer }),
  ]),
  nextHeightInterval: 1,
  lockAddress: process.env.NEXT_PUBLIC_BITCOIN_LOCK_ADDRESS!,
};

export default BitcoinNetwork;
