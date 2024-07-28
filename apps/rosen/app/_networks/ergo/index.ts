import { nautilusWalletCreator } from '@rosen-ui/nautilus-wallet';

import { Networks } from '@rosen-ui/constants';

import { unwrap } from '@/_errors';
import { ErgoNetwork as ErgoNetworkType } from '@/_types/network';
import { ErgoIcon } from '@rosen-bridge/icons';

import {
  fee as ergoFee,
  minBoxValue as ergoMinBoxValue,
} from '@rosen-network/ergo/dist/src/constants';

import { getTokenMap, generateUnsignedTx } from './server';

/**
 * the main object for Ergo network
 * providing access to network info and wallets and network specific
 * functionality
 */
const ErgoNetwork: ErgoNetworkType = {
  name: Networks.ERGO,
  label: 'Ergo',
  wallets: [
    nautilusWalletCreator({
      getTokenMap: unwrap(getTokenMap),
      generateUnsignedTx: unwrap(generateUnsignedTx),
    }),
  ],
  logo: ErgoIcon,
  nextHeightInterval: 5,
  lockAddress: process.env.NEXT_PUBLIC_ERGO_LOCK_ADDRESS!,

  // THIS FUNCTION WORKS WITH WRAPPED-VALUE
  async getMaxTransfer({ balance, isNative }) {
    const tokenMap = await unwrap(getTokenMap)();
    const feeAndMinBoxValueWrapped = tokenMap.wrapAmount(
      'erg',
      ergoFee + ergoMinBoxValue,
      Networks.ERGO,
    ).amount;
    const offsetCandidateWrapped = Number(feeAndMinBoxValueWrapped);
    const shouldApplyOffset = isNative;
    const offset = shouldApplyOffset ? offsetCandidateWrapped : 0;
    const amount = balance - offset;
    return amount < 0 ? 0 : amount;
  },
};

export default ErgoNetwork;
