import { useCallback, useEffect, useState } from 'react';

import { Sort } from '../components';

type Params = Record<string, unknown>;

export const useCollection = () => {
  const [filters, setFilters] = useState<Params>();

  const [pageIndex, setPageIndex] = useState<number>();

  const [pageSize, setPageSize] = useState<number>();

  const [params, setParams] = useState<Params>();

  const [sort, setSort] = useState<Sort>();

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setPageIndex(0);
  }, []);

  useEffect(() => {
    const result: Params = {};

    if (typeof pageSize === 'number') {
      result.limit = pageSize;
    }

    if (typeof pageSize === 'number' && typeof pageIndex === 'number') {
      result.offset = pageSize * pageIndex;
    }

    if (sort?.key) {
      result.sort = `${sort.key}${sort.order ? '-' + sort.order : ''}`;
    }

    if (filters) {
      Object.assign(result, filters);
    }

    if (Object.keys(result).length) {
      setParams(result);
    } else {
      setParams(undefined);
    }
  }, [filters, pageIndex, pageSize, sort]);

  return {
    params,

    filters,
    setFilters,

    pageIndex,
    setPageIndex,

    pageSize,
    setPageSize: handlePageSizeChange,

    sort,
    setSort,
  };
};
