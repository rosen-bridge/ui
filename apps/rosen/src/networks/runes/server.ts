'use server';

import { getMaxTransferCreator } from '@rosen-network/runes';

import { wrap } from '@/safeServerAction';
import { getTokenMap } from '@/tokenMap/getServerTokenMap';

export const getMaxTransfer = wrap(getMaxTransferCreator(getTokenMap), {
  traceKey: 'runes:getMaxTransfer',
});
