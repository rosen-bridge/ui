import { fetcher } from '@rosen-ui/swr-helpers';
import useSWR from 'swr';

import { ApiAddressAssetsResponse } from '@/types/api';

/**
 * fetch a token info (if present)
 */
export const useToken = (tokenId: string | undefined) => {
  const { data, isLoading } = useSWR<ApiAddressAssetsResponse>(
    tokenId
      ? [
          '/address/assets',
          {
            tokenId,
          },
        ]
      : null,
    fetcher,
  );

  return {
    token: data?.items[0],
    isLoading,
  };
};
