import { BitcoinIcon } from '@rosen-bridge/icons';
import { xdefiWalletCreator } from '@rosen-ui/xdefi-wallet';

import { TokenMap } from '@rosen-bridge/tokens';
import { getRosenTokens } from '@/_backend/utils';

import { getMaxTransfer } from './getMaxTransfer';

import { Networks } from '@rosen-ui/constants';

import { unwrap } from '@/_errors';
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
  name: Networks.BITCOIN,
  label: 'Bitcoin',
  logo: BitcoinIcon,
  wallets: [
    xdefiWalletCreator({
      tokenMap: new TokenMap(getRosenTokens()),
      generateOpReturnData: unwrap(generateOpReturnData),
      generateUnsignedTx: unwrap(generateUnsignedTx),
      getAddressBalance: unwrap(getAddressBalance),
      submitTransaction: unwrap(submitTransaction),
    }),
  ],
  nextHeightInterval: 1,
  lockAddress: process.env.NEXT_PUBLIC_BITCOIN_LOCK_ADDRESS!,
  getMaxTransfer: unwrap(getMaxTransfer),
};

export default BitcoinNetwork;
