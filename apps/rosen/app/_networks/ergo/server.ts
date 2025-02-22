'use server';

import { getMaxTransferCreator } from '@rosen-network/ergo';

import { wrap } from '@/_safeServerAction';
import { getTokenMap } from '@/_tokenMap/getServerTokenMap';

export const getMaxTransfer = wrap(getMaxTransferCreator(getTokenMap), {
  traceKey: 'getMaxTransfer',
});
