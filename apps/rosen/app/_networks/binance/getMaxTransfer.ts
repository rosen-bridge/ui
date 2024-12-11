'use server';

import { wrap } from '@/_safeServerAction';
import { BinanceNetwork } from '@/_types';

/**
 * get max transfer for binance
 */
const getMaxTransferCore: BinanceNetwork['getMaxTransfer'] = async ({
  balance,
  isNative,
}) => {
  return balance;
};

export const getMaxTransfer = wrap(getMaxTransferCore, {
  traceKey: 'getMaxTransferBinance',
});
