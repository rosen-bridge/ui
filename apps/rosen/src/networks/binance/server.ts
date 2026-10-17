'use server';

import { validateAddress as validateAddressCore } from '@rosen-network/base';
import {
  calculateFee as calculateFeeCore,
  getMaxTransferCreator as getMaxTransferCore,
  getMinTransferCreator,
} from '@rosen-network/binance';
import { generateLockTx as generateLockTxCore } from '@rosen-network/evm';

import { wrap } from '@/safeServerAction';
import { getTokenMap } from '@/tokenMap/getServerTokenMap';

export const calculateFee = wrap(calculateFeeCore, {
  cache: 10 * 60 * 1000,
  traceKey: 'binance:calculateFee',
});

export const generateLockTx = wrap(generateLockTxCore(getTokenMap), {
  traceKey: 'binance:generateLockTx',
});

export const getMaxTransfer = wrap(getMaxTransferCore(getTokenMap), {
  traceKey: 'binance:getMaxTransfer',
});

export const getMinTransfer = wrap(getMinTransferCreator(getTokenMap), {
  traceKey: 'binance:getMinTransfer',
});

export const validateAddress = wrap(validateAddressCore, {
  cache: Infinity,
  traceKey: 'binance:validateAddress',
});
