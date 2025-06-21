import { useCallback, useMemo, useState } from 'react';

import { fetcher } from '@rosen-ui/swr-helpers';
import { Paginated } from '@rosen-ui/types';
import useSWR from 'swr';

import { Sort } from '../components';

export type UseDataFetcherOptions = {
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
export const useDataFetcher = <T extends Paginated<unknown>>({
  api,
  // baseUrl,
  initialPageSize = 10,
  initialPageIndex = 0,
}: UseDataFetcherOptions) => {
  const [pageIndex, setPageIndex] = useState<number>(initialPageIndex);

  const [pageSize, setPageSize] = useState<number>(initialPageSize);

  const [query, setQuery] = useState<string | undefined>();

  const [sort, setSort] = useState<Sort | undefined>();

  const params = useMemo(() => {
    const params: string[] = [];

    params.push(`offset=${pageIndex * pageSize}`);

    params.push(`limit=${pageSize}`);

    if (query) {
      params.push(query);
    }

    if (sort?.key) {
      params.push(`sort=${sort.key}${sort.order ? '-' + sort.order : ''}`);
    }

    return params.join('&');
  }, [pageIndex, pageSize, query, sort]);

  const { data, isLoading } = useSWR<T>(`${api}?${params}`, fetcher, {
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
