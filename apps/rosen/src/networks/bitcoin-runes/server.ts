'use server';

import { validateAddress as validateAddressCore } from '@rosen-network/base';
import {
  calculateFee as calculateFeeCore,
  getMaxTransferCreator,
  getMinTransferCreator,
} from '@rosen-network/bitcoin-runes';

import { wrap } from '@/safeServerAction';
import { getTokenMap } from '@/tokenMap/getServerTokenMap';

export const calculateFee = wrap(calculateFeeCore, {
  cache: 10 * 60 * 1000,
  traceKey: 'bitcoinRunes:calculateFee',
});

export const getMaxTransfer = wrap(getMaxTransferCreator(getTokenMap), {
  traceKey: 'bitcoinRunes:getMaxTransfer',
});

export const getMinTransfer = wrap(getMinTransferCreator(getTokenMap), {
  traceKey: 'bitcoinRunes:getMinTransfer',
});

export const validateAddress = wrap(validateAddressCore, {
  cache: Infinity,
  traceKey: 'bitcoinRunes:validateAddress',
});
