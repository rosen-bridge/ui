'use server';

import { validateAddress as validateAddressCore } from '@rosen-network/base';
import {
  calculateFee as calculateFeeCore,
  getMaxTransferCreator,
  getMinTransferCreator,
} from '@rosen-network/runes';

import { wrap } from '@/safeServerAction';
import { getTokenMap } from '@/tokenMap/getServerTokenMap';

export const calculateFee = wrap(calculateFeeCore, {
  cache: 10 * 60 * 1000,
  traceKey: 'runes:calculateFee',
});

export const getMaxTransfer = wrap(getMaxTransferCreator(getTokenMap), {
  traceKey: 'runes:getMaxTransfer',
});

export const getMinTransfer = wrap(getMinTransferCreator(getTokenMap), {
  traceKey: 'runes:getMinTransfer',
});

export const validateAddress = wrap(validateAddressCore, {
  cache: Infinity,
  traceKey: 'runes:validateAddress',
});
