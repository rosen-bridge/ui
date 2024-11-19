import useSWR from 'swr';

import { fetcher } from '@rosen-ui/swr-helpers';

import { useToken } from './useToken';

import { ApiInfoResponse } from '@/_types/api';

/**
 * fetch rsn token info (if present)
 */
export const useRsnToken = () => {
  const { data: info, isLoading: isInfoLoading } = useSWR<ApiInfoResponse>(
    '/info',
    fetcher,
  );

  const { token: rsnToken, isLoading: isRsnInfoLoading } = useToken(
    info?.rsnTokenId,
  );

  return {
    rsnToken,
    isLoading: isInfoLoading || isRsnInfoLoading,
  };
};
