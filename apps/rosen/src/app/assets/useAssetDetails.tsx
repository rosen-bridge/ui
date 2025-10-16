import { useMemo } from 'react';

import { fetcher } from '@rosen-ui/swr-helpers';
import useSWR from 'swr';

import { ApiAssetResponse } from '@/types';
import { Assets as AssetType } from '@/types/api';

export const useAssetDetails = (
  id: AssetType['id'],
  skeletonsCount: number = 2,
) => {
  const { data, isLoading } = useSWR<ApiAssetResponse>(
    `/v1/assets/detail/${id?.toLowerCase()}`,
    fetcher,
  );

  const bridgedAssets: ApiAssetResponse['bridged'] = useMemo(() => {
    if (!isLoading) return data?.bridged || [];
    return Array(skeletonsCount).fill({});
  }, [data, isLoading]);

  return {
    bridgedAssets,
    isLoading,
  };
};
