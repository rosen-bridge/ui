import { fetcher } from '@rosen-ui/swr-helpers';
import useSWR from 'swr';

import { ApiInfoResponse } from '@/_types/api';

import { useToken } from './useToken';

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
