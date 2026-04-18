import { useCallback, useMemo } from 'react';

import {
  paginationBuilder,
  PaginationBuilderParams,
  PaginationBuilderResult,
} from '@/components/pagination/buildPagination';

type UsePaginationParams = PaginationBuilderParams & {
  onPageChange: (page: number) => void;
};

type UsePaginationReturn = PaginationBuilderResult & {
  next: () => void;
  prev: () => void;
  setPage: (page: number) => void;
  goTo: (page: number) => void;
};

export const usePagination = ({
  total,
  currentPage,
  pageSize,
  siblingCount = 1,
  boundaryCount = 1,
  stable = true,
  onPageChange,
}: UsePaginationParams): UsePaginationReturn => {
  const pagination = useMemo(() => {
    return paginationBuilder({
      total,
      currentPage,
      pageSize,
      siblingCount,
      boundaryCount,
      stable,
    });
  }, [total, currentPage, pageSize, siblingCount, boundaryCount, stable]);

  const next = useCallback(() => {
    const maxPage = pagination.totalPages;

    if (currentPage < maxPage) {
      onPageChange(currentPage + 1);
    }
  }, [currentPage, pagination.totalPages, onPageChange]);

  const prev = useCallback(() => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  }, [currentPage, onPageChange]);

  const setPage = useCallback(
    (page: number) => {
      const safePage = Math.max(1, Math.min(page, pagination.totalPages));
      onPageChange(safePage);
    },
    [pagination.totalPages, onPageChange],
  );

  const goTo = useCallback(
    (page: number | string) => {
      if (page === '...') return;

      const safePage = Math.max(1, Math.min(Number(page), pagination.totalPages));
      onPageChange(safePage);
    },
    [pagination.totalPages, onPageChange],
  );

  return {
    ...pagination,
    next,
    prev,
    setPage,
    goTo,
  };
};
