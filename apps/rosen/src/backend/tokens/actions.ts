'use server';

import { wrap } from '@/safeServerAction';

import { getTokensByIds as getTokensByIdsBase } from './services';

export const getTokensByIds = wrap(getTokensByIdsBase, {
  traceKey: 'getTokensByIds',
});
