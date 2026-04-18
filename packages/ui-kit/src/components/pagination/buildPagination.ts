export type PaginationItem = number | '...';
// each item is a page number or "..." for gap

export type PaginationBuilderParams = {
  total: number; // total items count
  currentPage: number; // current active page
  pageSize: number; // items per page
  siblingCount?: number; // pages around current page
  boundaryCount?: number; // pages at start and end
  stable?: boolean; // use special logic for start/end
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
  stable = true,
}: PaginationBuilderParams): PaginationBuilderResult => {
  /**
   *  calculate total pages
   */
  const countPage = Math.ceil(total / pageSize);

  const range = (start: number, end: number): number[] => {
    /**
     * create array from start to end
     */
    if (start > end) return [];
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  /**
   * final pages list
   */
  let pages: PaginationItem[] = [];

  if (stable) {
    /**
     * size of first/last window
     */
    const initialWindow = boundaryCount + siblingCount + 1;

    /**
     * user is near start
     */
    if (currentPage <= initialWindow) {
      /**
       *  get first pages
       */
      const start = range(1, initialWindow);

      /**
       * if not reaching last page
       */
      if (start.at(-1)! < countPage) {
        /**
         * add "..." and last page
         */
        pages = [...start, '...', countPage];
      } else {
        /**
         * no need for "..."
         */
        pages = start;
      }
    }
    /**
     * user is near end
     */
    if (currentPage > countPage - initialWindow) {
      /**
       *  get last pages
       */
      const end = range(countPage - initialWindow + 1, countPage);

      /**
       * if not starting from page 1
       */
      if (end[0] > 1) {
        /**
         * add first page and "..."
         */
        pages = [1, '...', ...end];
      } else {
        /**
         * no need for "..."
         */
        pages = end;
      }
    }
  }

  /**
   * middle case (not start, not end)
   */
  if (pages.length === 0) {
    const set = new Set<number>([
      /**
       * first pages
       */
      ...range(1, boundaryCount),

      /**
       * last pages
       */
      ...range(countPage - boundaryCount + 1, countPage),

      /**
       *  pages around current page
       */
      ...range(currentPage - siblingCount, currentPage + siblingCount),
    ]);

    const sortedPages = Array.from(set)
      /**
       *  remove invalid pages
       */
      .filter((p): p is number => p >= 1 && p <= countPage)

      .sort((a, b) => a - b);
    /** sort pages */

    const result: PaginationItem[] = [];

    for (let i = 0; i < sortedPages.length; i++) {
      const current = sortedPages[i];
      const prev = sortedPages[i - 1];

      if (i > 0) {
        /**  only one page missing */
        if (current - prev === 2) {
          result.push(prev + 1);
          /** add that page */
        } else if (current - prev > 2) {
          /** many pages missing */

          result.push('...');
          /** add "..."*/
        }
      }

      result.push(current);
      /** always add current page */
    }

    pages = result;
    /** save final pages */
  }

  const from = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  /** first item index in current page */

  const to = Math.min(currentPage * pageSize, total);
  /** last item index in current page */

  return {
    pages,
    from,
    to,
    totalPages: countPage,
  };
};
