import { useCallback, useMemo, useState } from 'react';

import { fetcher } from '@rosen-ui/swr-helpers';
import { Paginated } from '@rosen-ui/types';
import useSWR from 'swr';

import { Sort } from '../components';

export type UseDataTableOptions = {
  api: string;
  baseUrl?: string;
  initialPageSize?: number;
  initialPageIndex?: number;
};

/**
 * Custom hook to fetch and manage paginated data using SWR.
 *
 * @param options.api - API endpoint
 * @param options.baseUrl - Base URL to prepend to the API endpoint
 * @param options.initialPageSize - number of item per page in the component first render, this parameter is optional and if not provided
 *  it will default to 10 items per page
 * @param options.initialPageIndex - starting page index, this is an optional parameter and if not provided it will default to 0
 */
export const useDataTable = <T extends Paginated<unknown>>({
  api,
  // baseUrl,
  initialPageSize = 10,
  initialPageIndex = 0,
}: UseDataTableOptions) => {
  const [pageIndex, setPageIndex] = useState<number>(initialPageIndex);

  const [pageSize, setPageSize] = useState<number>(initialPageSize);

  const [query, setQuery] = useState<string | undefined>();

  const [sort, setSort] = useState<Sort | undefined>();

  const params = useMemo(
    () => ({
      offset: pageIndex * pageSize,
      limit: pageSize,
      sort: sort && `${sort.key}${sort.order ? '-' + sort.order : ''}`,
      query: query || undefined,
    }),
    [pageIndex, pageSize, query, sort],
  );

  const { data, isLoading } = useSWR<T>([api, params], fetcher, {
    keepPreviousData: true,
  });

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setPageIndex(0);
  }, []);

  return {
    isLoading,
    items: (data?.items || []) as T['items'],
    total: data?.total || 0,
    pageIndex,
    setPageIndex,
    pageSize,
    setPageSize: handlePageSizeChange,
    query,
    setQuery,
    sort,
    setSort,
  };
};
