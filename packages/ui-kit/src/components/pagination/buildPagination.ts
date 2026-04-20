export type PaginationItem = number | '...';
// each item is a page number or "..." for gap

export type PaginationBuilderParams = {
  total?: number; // total items count
  currentPage: number; // current active page
  pageSize: number; // items per page
  siblingCount?: number; // pages around current page
  boundaryCount?: number; // pages at start and end
};

export type PaginationBuilderResult = {
  pages: PaginationItem[]; // pages for UI
  from: number; // first item index
  to: number; // last item index
  totalPages: number; // total pages count
};

export const paginationBuilder = ({
  total,
  currentPage,
  pageSize,
  siblingCount = 1,
  boundaryCount = 1,
}: PaginationBuilderParams): PaginationBuilderResult => {
  if (!total || total <= 0 || !pageSize || pageSize <= 0) {
    return {
      pages: [],
      from: 0,
      to: 0,
      totalPages: 0,
    };
  }

  const safeTotal = total > 0 ? total : 0;

  const safePageSize = pageSize > 0 ? pageSize : 1;

  const countPage = Math.max(1, Math.ceil(safeTotal / safePageSize));

  const safeCurrentPage = Math.min(Math.max(currentPage, 1), countPage);

  const range = (start: number, end: number): number[] => {
    if (start > end) return [];

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  let pages: PaginationItem[] = [];

  const startBoundaries = boundaryCount > 0 ? range(1, boundaryCount) : [];

  const endBoundaries =
    boundaryCount > 0 ? range(countPage - boundaryCount + 1, countPage) : [];

  const set = new Set<number>([
    ...startBoundaries,
    ...endBoundaries,
    ...range(safeCurrentPage - siblingCount, safeCurrentPage + siblingCount), // pages around current page
  ]);

  const sortedPages = Array.from(set)
    //remove invalid pages
    .filter((p): p is number => p >= 1 && p <= countPage)
    .sort((a, b) => a - b);

  const result: PaginationItem[] = [];

  if (sortedPages[0] > 1) {
    result.push('...');
  }

  for (let i = 0; i < sortedPages.length; i++) {
    const current = sortedPages[i];

    const prev = sortedPages[i - 1];

    if (i > 0 && current - prev > 1) {
      result.push('...');
    }

    result.push(current);
  }

  if (sortedPages[sortedPages.length - 1] < countPage) {
    result.push('...');
  }

  pages = result;

  const from = safeTotal === 0 ? 0 : (safeCurrentPage - 1) * safePageSize + 1;

  const to =
    safeTotal === 0 ? 0 : Math.min(safeCurrentPage * safePageSize, safeTotal);

  return {
    pages,
    from,
    to,
    totalPages: countPage,
  };
};
