'use server';

import { ETH_TRANSFER_GAS, getFeeData } from '@rosen-network/evm';
import { NATIVE_TOKENS, NETWORKS } from '@rosen-ui/constants';

import { wrap } from '@/_safeServerAction';
import { getTokenMap } from '@/_tokenMap/getServerTokenMap';
import { EthereumNetwork } from '@/_types';

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
  const tokenMap = getTokenMap();

  const wrappedFee = tokenMap.wrapAmount(
    NATIVE_TOKENS.ETHEREUM,
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
