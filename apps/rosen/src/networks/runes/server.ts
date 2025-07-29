'use server';

import { validateAddress as validateAddressCore } from '@rosen-network/base';
import { getMaxTransferCreator } from '@rosen-network/runes';

import { wrap } from '@/safeServerAction';
import { getTokenMap } from '@/tokenMap/getServerTokenMap';

export const getMaxTransfer = wrap(getMaxTransferCreator(getTokenMap), {
  traceKey: 'runes:getMaxTransfer',
});

export const validateAddress = wrap(validateAddressCore, {
  cache: Infinity,
  traceKey: 'runes:validateAddress',
});
