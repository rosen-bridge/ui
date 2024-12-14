'use server';

import { NATIVE_TOKEN_TRANSFER_GAS, getFeeData } from '@rosen-network/evm';
import { NATIVE_TOKENS, NETWORKS } from '@rosen-ui/constants';

import { wrap } from '@/_safeServerAction';
import { getTokenMap } from '@/_tokenMap/getServerTokenMap';
import { BinanceNetwork } from '@/_types';

/**
 * get max transfer for binance
 */
const getMaxTransferCore: BinanceNetwork['getMaxTransfer'] = async ({
  balance,
  isNative,
}) => {
  const feeData = await getFeeData();
  if (!feeData.gasPrice) throw Error(`gas price is null`);
  const estimatedFee = feeData.gasPrice * NATIVE_TOKEN_TRANSFER_GAS;
  const tokenMap = getTokenMap();

  const wrappedFee = tokenMap.wrapAmount(
    NATIVE_TOKENS.BINANCE,
    estimatedFee,
    NETWORKS.BINANCE,
  ).amount;
  const offset = isNative ? wrappedFee : 0n;
  const amount = balance - offset;
  return amount < 0n ? 0n : amount;
};

export const getMaxTransfer = wrap(getMaxTransferCore, {
  traceKey: 'getMaxTransferBinance',
});
