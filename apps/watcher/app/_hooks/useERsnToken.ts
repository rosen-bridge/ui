import useSWR from 'swr';

import { fetcher } from '@rosen-ui/swr-helpers';

import { useToken } from './useToken';

import { ApiInfoResponse } from '@/_types/api';

/**
 * fetch ersn token info (if present)
 */
export const useERsnToken = () => {
  const { data: info, isLoading: isInfoLoading } = useSWR<ApiInfoResponse>(
    '/info',
    fetcher,
  );

  const { token: eRsnToken, isLoading: isERsnInfoLoading } = useToken(
    info?.eRsnTokenId,
  );

  return {
    eRsnToken,
    isLoading: isInfoLoading || isERsnInfoLoading,
  };
};
