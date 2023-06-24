import { useState, useMemo } from 'react';

export interface UsePaginationOptions {
  startPageNumber?: number;
  rowsPerPage?: number;
}

/**
 *
 * @param data - list of row to do pagination
 * @param enabled - optional boolean to enable pagination
 * if ont provided it defaults to true
 * @param options - options object to config the page size and
 * starting page index
 * @returns
 */
export const usePagination = <T>(
  data: T[],
  enabled = true,
  options?: UsePaginationOptions
) => {
  const [page, setPage] = useState(options?.startPageNumber || 0);
  const [rowsPerPage, setRowsPerPage] = useState(options?.rowsPerPage || 10);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const visibleRows = useMemo(
    () =>
      enabled
        ? data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        : data,
    [data, page, rowsPerPage, enabled]
  );

  return {
    page,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    visibleRows,
  };
};
