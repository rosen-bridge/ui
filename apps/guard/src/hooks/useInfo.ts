import { fetcher } from '@rosen-ui/swr-helpers';
import useSWR from 'swr';

import type { ApiInfoResponse } from '@/types/api';

/**
 * wrap useSWR for fetching info api
 */
export const useInfo = () =>
  useSWR<ApiInfoResponse>('/info', fetcher, { dedupingInterval: 25000 });
