import {
  nautilusWalletCreator,
  nautilusWalletInfo,
} from '@rosen-ui/nautilus-wallet';
import { compact } from 'lodash-es';

import { Networks } from '@/_constants';

import { Network } from '@/_types/network';
import { Wallet } from '@rosen-ui/wallet-api';
import { ErgoIcon } from '@rosen-bridge/icons';

import {
  fee as ergoFee,
  minBoxValue as ergoMinBoxValue,
} from '@rosen-ui/nautilus-wallet/dist/src/constants';

import { generateUnsignedTxNautilus } from './server';

/**
 * the main object for Ergo network
 * providing access to network info and wallets and network specific
 * functionality
 */
const ErgoNetwork: Network<Wallet> = {
  name: Networks.ergo,
  label: 'Ergo',
  supportedWallets: [nautilusWalletInfo],
  availableWallets: compact([
    nautilusWalletCreator({
      generateUnsignedTx: generateUnsignedTxNautilus,
    }),
  ]),
  logo: ErgoIcon,
  nextHeightInterval: 5,
  lockAddress: process.env.NEXT_PUBLIC_ERGO_LOCK_ADDRESS!,
  async getMaxTransferableAmount(balance, isNative) {
    const offsetCandidate = Number(ergoFee + ergoMinBoxValue);
    const shouldApplyOffset = isNative;
    const offset = shouldApplyOffset ? offsetCandidate : 0;
    const amount = balance - offset;
    return amount < 0 ? 0 : amount;
  },
};

export default ErgoNetwork;
