import { useCallback, useState } from 'react';
import useSWR, { Key } from 'swr';

import { fetcher } from '@rosen-ui/swr-helpers';
import { Paginated } from '@rosen-ui/types';

/**
 * this hook uses swr to to fetch and manage paginated data.
 *
 * @param getKey - a function that takes the offset and limit as param and returns a unique and valid swr key for the page
 * @param initialPageSize - number of item per page in the component first render, this parameter is optional and if not provided
 *  it will default to 10 items per page
 * @param initialPageIndex - starting page index, this is an optional parameter and if not provided it will default to 0
 */
export const useTableDataPagination = <T extends Paginated<unknown>>(
  getKey: (offset: number, limit: number) => Key,
  initialPageSize = 10,
  initialPageIndex = 0,
) => {
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [pageIndex, setPageIndex] = useState<number>(initialPageIndex);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPageIndex(0);
  }, []);

  const { data, isLoading } = useSWR<T>(
    getKey(pageIndex * pageSize, pageSize),
    fetcher,
    {
      keepPreviousData: true,
    },
  );

  return {
    isLoading,
    data,
    setPageSize: handlePageSizeChange,
    pageSize,
    pageIndex,
    setPageIndex,
    isFirstLoad: isLoading && !data,
    isFirstPage: pageIndex === 0,
    isLastPage: (pageIndex + 1) * pageSize >= (data?.total ?? 0),
  };
};
