import { useCallback, useMemo } from 'react';

export type PaginationValue = number | '...';

export type PaginationItem = {
  id: string;
  value: PaginationValue;
};

export type UsePaginationParams = {
  total?: number;
  currentPage: number;
  pageSize: number;
  siblingCount?: number;
  boundaryCount?: number;
  onPageChange: (page: number) => void;
};

export const usePagination = ({
  total,
  currentPage,
  pageSize,
  siblingCount = 1,
  boundaryCount = 1,
  onPageChange,
}: UsePaginationParams) => {
  const paginationData = useMemo(() => {
    if (!total || total <= 0 || !pageSize || pageSize <= 0) {
      return { pages: [], from: 0, to: 0, totalPages: 0 };
    }

    const safeTotal = Math.max(total, 0);
    const safePageSize = Math.max(pageSize, 1);
    const countPage = Math.max(1, Math.ceil(safeTotal / safePageSize));
    const safeCurrentPage = Math.min(Math.max(currentPage, 1), countPage);

    const range = (start: number, end: number) => {
      if (start > end) return [];
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    const startBoundaries = boundaryCount > 0 ? range(1, boundaryCount) : [];
    const endBoundaries = boundaryCount > 0 ? range(countPage - boundaryCount + 1, countPage) : [];

    const set = new Set<number>([
      ...startBoundaries,
      ...endBoundaries,
      ...range(safeCurrentPage - siblingCount, safeCurrentPage + siblingCount),
    ]);

    const sortedPages = Array.from(set)
      .filter((p) => p >= 1 && p <= countPage)
      .sort((a, b) => a - b);

    const pages: PaginationItem[] = [];
    let ellipsisCount = 0;

    for (let i = 0; i < sortedPages.length; i++) {
      const current = sortedPages[i];
      const prev = sortedPages[i - 1];

      if (i === 0 && current > 1) {
        pages.push({ id: `ellipsis-${ellipsisCount++}`, value: '...' });
      } else if (i > 0 && current - prev > 1) {
        pages.push({ id: `ellipsis-${ellipsisCount++}`, value: '...' });
      }

      pages.push({ id: `page-${current}`, value: current });
    }

    if (sortedPages.length > 0 && sortedPages[sortedPages.length - 1] < countPage) {
      pages.push({ id: `ellipsis-${ellipsisCount++}`, value: '...' });
    }

    const from = safeTotal === 0 ? 0 : (safeCurrentPage - 1) * safePageSize + 1;
    const to = safeTotal === 0 ? 0 : Math.min(safeCurrentPage * safePageSize, safeTotal);

    return { pages, from, to, totalPages: countPage };
  }, [total, currentPage, pageSize, siblingCount, boundaryCount]);

  const maxPage = paginationData.totalPages;

  const setPage = useCallback(
    (page: number | string) => {
      if (page === '...') return;

      const num = Number(page);
      if (Number.isNaN(num)) return;

      const safePage = Math.max(1, Math.min(num, maxPage));
      if (safePage !== currentPage) {
        onPageChange(safePage);
      }
    },
    [maxPage, currentPage, onPageChange],
  );

  const next = useCallback(() => setPage(currentPage + 1), [currentPage, setPage]);
  const prev = useCallback(() => setPage(currentPage - 1), [currentPage, setPage]);

  return {
    ...paginationData,
    next,
    prev,
    setPage,
    hasNext: currentPage < maxPage,
    hasPrev: currentPage > 1,
  };
};
