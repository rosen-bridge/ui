import useSWR from 'swr';

import { fetcher } from '@rosen-ui/swr-helpers';

import { ApiAddressAssetsResponse } from '@/_types/api';

/**
 * fetch a token info (if present)
 */
const useToken = (tokenId: string | undefined) => {
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

export default useToken;
