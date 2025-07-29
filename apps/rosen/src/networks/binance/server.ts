'use server';

import { validateAddress as validateAddressCore } from '@rosen-network/base';
import { getMaxTransferCreator as getMaxTransferCore } from '@rosen-network/binance';
import {
  generateLockData as generateLockDataCore,
  generateTxParameters as generateTxParametersCore,
} from '@rosen-network/evm';

import { wrap } from '@/safeServerAction';
import { getTokenMap } from '@/tokenMap/getServerTokenMap';

export const generateLockData = wrap(generateLockDataCore, {
  traceKey: 'binance:generateLockData',
});

export const generateTxParameters = wrap(
  generateTxParametersCore(getTokenMap),
  {
    traceKey: 'binance:generateTxParameters',
  },
);

export const getMaxTransfer = wrap(getMaxTransferCore(getTokenMap), {
  traceKey: 'binance:getMaxTransfer',
});

export const validateAddress = wrap(validateAddressCore, {
  cache: Infinity,
  traceKey: 'binance:validateAddress',
});
