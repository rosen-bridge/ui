'use server';

import { NATIVE_TOKENS, NETWORKS } from '@rosen-ui/constants';

import { wrap } from '@/_safeServerAction';
import { EthereumNetwork } from '@/_types/network';

import { getTokenMap } from '../getTokenMap.server';
import { RosenAmountValue } from '@rosen-ui/types';
import { ETH_TRANSFER_GAS, getFeeData } from '@rosen-network/ethereum';

/**
 * get max transfer for ethereum
 */
const getMaxTransferCore: EthereumNetwork['getMaxTransfer'] = async ({
  balance,
  isNative,
}) => {
  const feeData = await getFeeData();
  if (!feeData.gasPrice) throw Error(`gas price is null`);
  const estimatedFee = feeData.gasPrice * ETH_TRANSFER_GAS;
  const tokenMap = await getTokenMap();

  const wrappedFee = tokenMap.wrapAmount(
    NATIVE_TOKENS[NETWORKS.ETHEREUM],
    estimatedFee,
    NETWORKS.ETHEREUM,
  ).amount;
  const offset = isNative ? wrappedFee : 0n;
  const amount = balance - offset;
  return amount < 0n ? 0n : amount;
};

export const getMaxTransfer = wrap(getMaxTransferCore, {
  traceKey: 'getMaxTransferEthereum',
});
