import { useMemo } from 'react';

import useSWR from 'swr';

import { fetcher } from '@rosen-ui/swr-helpers';
import type { Network } from '@rosen-ui/types';

import type { ApiBalanceResponse } from '@/types/api';

/**
 * wrap useSWR for fetching balance api
 */
export const useBalance = (chain?: Network) => {
  const key = useMemo(() => {
    return [
      '/balance',
      Object.assign(
        {},
        {
          offset: 0,
          limit: 100,
        },
        chain ? { chain } : {},
      ),
    ];
  }, [chain]);

  return useSWR<ApiBalanceResponse>(key, fetcher);
};
