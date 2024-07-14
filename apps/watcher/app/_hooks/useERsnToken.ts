import useSWR from 'swr';

import { fetcher } from '@rosen-ui/swr-helpers';

import useToken from './useToken';

import { ApiInfoResponse } from '@/_types/api';

/**
 * fetch rsn token info (if present)
 */
const useERsnToken = () => {
  const { data: info, isLoading: isInfoLoading } = useSWR<ApiInfoResponse>(
    '/info',
    fetcher,
  );

  const { token: eRsnToken, isLoading: isRsnInfoLoading } = useToken(
    info?.eRsnTokenId,
  );

  return {
    eRsnToken,
    isLoading: isInfoLoading || isRsnInfoLoading,
  };
};

export default useERsnToken;
