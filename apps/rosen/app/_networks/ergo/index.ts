import {
  nautilusWalletCreator,
  nautilusWalletInfo,
} from '@rosen-ui/nautilus-wallet';
import { compact } from 'lodash-es';

import { Networks } from '@rosen-ui/constants';

import { ErgoNetwork as ErgoNetworkType } from '@/_types/network';
import { ErgoIcon } from '@rosen-bridge/icons';

import {
  fee as ergoFee,
  minBoxValue as ergoMinBoxValue,
} from '@rosen-network/ergo/dist/src/constants';

import { generateUnsignedTx } from './server';

/**
 * the main object for Ergo network
 * providing access to network info and wallets and network specific
 * functionality
 */
const ErgoNetwork: ErgoNetworkType = {
  name: Networks.ERGO,
  label: 'Ergo',
  supportedWallets: [nautilusWalletInfo],
  availableWallets: compact([
    nautilusWalletCreator({
      generateUnsignedTx,
    }),
  ]),
  logo: ErgoIcon,
  nextHeightInterval: 5,
  lockAddress: process.env.NEXT_PUBLIC_ERGO_LOCK_ADDRESS!,
  async getMaxTransfer({ balance, isNative }) {
    const offsetCandidate = Number(ergoFee + ergoMinBoxValue);
    const shouldApplyOffset = isNative;
    const offset = shouldApplyOffset ? offsetCandidate : 0;
    const amount = balance - offset;
    return amount < 0 ? 0 : amount;
  },
};

export default ErgoNetwork;
