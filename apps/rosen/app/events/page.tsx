'use client';

/**
 * TODO: Convert this page to SSR mode
 * local:ergo/rosen-bridge/ui#307
 */
import { MouseEvent, useCallback, useMemo } from 'react';

import {
  EnhancedTable,
  Paper,
  TablePaginationProps,
  useTableDataPagination,
} from '@rosen-bridge/ui-kit';

import { ApiEventResponse, Event } from '@/_types/api';

import { MobileRow, TabletRow, mobileHeader, tabletHeader } from './TableRow';
import { TableSkeleton } from './TableSkeleton';

const getKey = (offset: number, limit: number) => {
  return ['/v1/events', { offset, limit }];
};

export default function Events() {
  const {
    data,
    isLoading,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    isFirstLoad,
    isFirstPage,
    isLastPage,
  } = useTableDataPagination<ApiEventResponse>(getKey);

  const handleChangePage = useCallback(
    (event: MouseEvent<HTMLButtonElement> | null, newPage: number) => {
      setPageIndex(newPage);
    },
    [setPageIndex],
  );

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPageSize(parseInt(event.target.value, 10));
    },
    [setPageSize],
  );

  const renderMobileRow = useCallback(
    (rowData: Event) => <MobileRow {...rowData} isLoading={isLoading} />,
    [isLoading],
  );

  const renderTabletRow = useCallback(
    (rowData: Event) => <TabletRow {...rowData} isLoading={isLoading} />,
    [isLoading],
  );

  const tableHeaderProps = useMemo(
    () => ({
      mobile: mobileHeader,
      tablet: tabletHeader,
    }),
    [],
  );

  const tableRenderRowProps = useMemo(
    () => ({
      mobile: renderMobileRow,
      tablet: renderTabletRow,
    }),
    [renderMobileRow, renderTabletRow],
  );

  const paginationProps = useMemo<TablePaginationProps>(
    () => ({
      component: 'div',
      count: data?.total ?? 0,
      rowsPerPage: pageSize,
      page: pageIndex,
      onPageChange: handleChangePage,
      onRowsPerPageChange: handleChangeRowsPerPage,
      nextIconButtonProps: {
        disabled: isLoading || isLastPage,
      },
      backIconButtonProps: {
        disabled: isLoading || isFirstPage,
      },
      SelectProps: {
        disabled: isLoading,
      },
    }),
    [
      data?.total,
      pageIndex,
      pageSize,
      handleChangePage,
      handleChangeRowsPerPage,
      isLoading,
      isFirstPage,
      isLastPage,
    ],
  );

  return (
    <>
      <Paper sx={{ overflow: 'hidden' }}>
        {isFirstLoad && <TableSkeleton numberOfItems={pageSize} />}
        {!isFirstLoad && data && (
          <EnhancedTable
            data={data.items}
            responsiveHead={tableHeaderProps}
            responsiveRenderRow={tableRenderRowProps}
            paginated={true}
            tablePaginationProps={paginationProps}
          />
        )}
      </Paper>
    </>
  );
}
