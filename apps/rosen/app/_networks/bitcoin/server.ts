'use server';

import { getMaxTransferCreator } from '@rosen-network/bitcoin';

import { wrap } from '@/_safeServerAction';
import { getTokenMap } from '@/_tokenMap/getServerTokenMap';

export const getMaxTransfer = wrap(getMaxTransferCreator(getTokenMap()), {
  traceKey: 'getMaxTransfer',
});
