import { fetcher } from '@rosen-ui/swr-helpers';
import useSWR from 'swr';

import { ApiBalanceResponse } from '@/_types/api';

/**
 * wrap useSWR for fetching balance api
 */
export const useBalance = () => useSWR<ApiBalanceResponse>('/balance', fetcher);
