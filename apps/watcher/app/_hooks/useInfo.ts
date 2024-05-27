import { fetcher } from '@rosen-ui/swr-helpers';
import useSWR from 'swr';

import { ApiInfoResponse } from '@/_types/api';

/**
 * wrap useSWR for fetching info api
 */
const useInfo = () => useSWR<ApiInfoResponse>('/info', fetcher);

export default useInfo;
