import { fetcher } from '@rosen-ui/swr-helpers';
import useSWR from 'swr';

import { ApiInfoResponse } from '@/_types/api';

import { useToken } from './useToken';

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
