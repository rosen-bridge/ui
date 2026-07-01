import { use } from 'react';

import { TokenMap } from '@rosen-bridge/tokens';

import { getTokenMap } from '@/tokenMap/getClientTokenMap';

let tokenMapPromise: Promise<TokenMap> | null = null;

const getTokenMapPromise = () => {
  if (!tokenMapPromise) {
    tokenMapPromise = getTokenMap().catch((error) => {
      tokenMapPromise = null;
      throw new Error('Failed to fetch TokenMap, reload the page.', {
        cause: error,
      });
    });
  }
  return tokenMapPromise;
};

export const useTokenMap = () => use(getTokenMapPromise());
