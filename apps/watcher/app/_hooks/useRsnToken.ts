import useSWR from 'swr';

import { fetcher } from '@rosen-ui/swr-helpers';

import { ApiAddressAssetsResponse, ApiInfoResponse } from '@/_types/api';

/**
 * fetch rsn token info (if present)
 */
const useRsnToken = () => {
  const { data: info, isLoading: isInfoLoading } = useSWR<ApiInfoResponse>(
    '/info',
    fetcher,
  );

  const { data, isLoading: isTokensListLoading } =
    useSWR<ApiAddressAssetsResponse>(
      info?.rsnTokenId
        ? [
            '/address/assets',
            {
              tokenId: info.rsnTokenId,
            },
          ]
        : null,
      fetcher,
    );

  return {
    rsnToken: data?.items[0],
    isLoading: isInfoLoading || isTokensListLoading,
  };
};

export default useRsnToken;
