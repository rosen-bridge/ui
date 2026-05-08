import { useCallback, useMemo } from 'react';

import {
  paginationBuilder,
  PaginationBuilderParams,
  PaginationBuilderResult,
} from '@/utils';

type UsePaginationParams = PaginationBuilderParams & {
  onPageChange: (page: number) => void; // 1-based
};

type UsePaginationReturn = PaginationBuilderResult & {
  next: () => void;
  prev: () => void;
  setPage: (page: number) => void;
  goTo: (page: number) => void;
  hasNext: boolean;
  hasPrev: boolean;
};

export const usePagination = ({
  total,
  currentPage,
  pageSize,
  siblingCount = 1,
  boundaryCount = 1,
  onPageChange,
}: UsePaginationParams): UsePaginationReturn => {
  const pagination = useMemo(() => {
    return paginationBuilder({
      total,
      currentPage,
      pageSize,
      siblingCount,
      boundaryCount,
    });
  }, [total, currentPage, pageSize, siblingCount, boundaryCount]);

  const maxPage = pagination.totalPages;

  // SAFE NAVIGATION (no duplicate logic, no +1/-1 chaos)
  const next = useCallback(() => {
    if (currentPage < maxPage) {
      onPageChange(currentPage + 1);
    }
  }, [currentPage, maxPage, onPageChange]);

  const prev = useCallback(() => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  }, [currentPage, onPageChange]);

  const setPage = useCallback(
    (page: number) => {
      const safePage = Math.max(1, Math.min(page, maxPage));
      onPageChange(safePage);
    },
    [maxPage, onPageChange],
  );

  const goTo = useCallback(
    (page: number | string) => {
      if (page === '...') return;

      const num = Number(page);
      if (Number.isNaN(num)) return;

      const safePage = Math.max(1, Math.min(num, maxPage));
      onPageChange(safePage);
    },
    [maxPage, onPageChange],
  );

  const hasNext = currentPage < maxPage;
  const hasPrev = currentPage > 1;

  return {
    ...pagination,
    next,
    prev,
    setPage,
    goTo,
    hasNext,
    hasPrev,
  };
};
