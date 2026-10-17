import { useEffect } from 'react';

import useSWRInfinite from 'swr/infinite';

import { fetcher } from '@rosen-ui/swr-helpers';

import type { ApiAddressAssetsResponse } from '@/types/api';

import {
  flattenAddressAssetsPages,
  getAddressAssetsPageKey,
  hasFetchedAllAddressAssets,
} from './addressAssetsPagination';

/**
 * fetch all assets of the watcher address from the paginated
 * `/address/assets` api: pages are requested one after another until
 * every token reported by the api is loaded, instead of only receiving
 * the first page like a plain `useSWR` call does
 */
export const useAllAddressAssets = () => {
  const { data, error, isLoading, setSize, size } = useSWRInfinite<ApiAddressAssetsResponse>(
    getAddressAssetsPageKey,
    fetcher,
  );

  const isLoadingMore = size > 0 && !!data && typeof data[size - 1] === 'undefined';
  const hasFetchedAll = hasFetchedAllAddressAssets(data);

  useEffect(() => {
    if (data && !error && !hasFetchedAll && !isLoadingMore) {
      void setSize((currentSize) => currentSize + 1);
    }
  }, [data, error, hasFetchedAll, isLoadingMore, setSize]);

  return {
    tokens: flattenAddressAssetsPages(data),
    isLoading: isLoading || (!error && !hasFetchedAll),
    error,
  };
};
