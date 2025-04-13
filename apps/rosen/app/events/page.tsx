'use client';

/**
 * TODO: Convert this page to SSR mode
 * local:ergo/rosen-bridge/ui#307
 */
import { MouseEvent, useCallback, useMemo, useState } from 'react';

import {
  EnhancedTable,
  Paper,
  SmartSearch,
  TablePaginationProps,
  useTableDataPagination,
} from '@rosen-bridge/ui-kit';

import { ApiEventResponse, Event } from '@/_types';

import { defaultSort, filters, sorts } from './smartSearchConfig';
import { MobileRow, TabletRow, mobileHeader, tabletHeader } from './TableRow';
import { TableSkeleton } from './TableSkeleton';

const getKey = (filters: string) => (offset: number, limit: number) => {
  // return ['/v1/events', filters];

  return [
    `/v1/events?offset=${offset}&limit=${limit}${filters ? '&' : ''}${filters}`,
  ];
};

const Events = () => {
  const [query, setQuery] = useState('');

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
  } = useTableDataPagination<ApiEventResponse>(getKey(query));

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
    (rowData: Event) => (
      <MobileRow key={rowData.id} {...rowData} isLoading={isLoading} />
    ),
    [isLoading],
  );

  const renderTabletRow = useCallback(
    (rowData: Event) => (
      <TabletRow key={rowData.id} {...rowData} isLoading={isLoading} />
    ),
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
      count: Number(data?.total ?? 0),
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
      <SmartSearch
        namespace="events"
        filters={filters}
        sorts={sorts}
        defaultSort={defaultSort}
        onChange={(selected) => {
          console.log('selected', selected);
          setQuery(selected.query);
        }}
      />
      <br />
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
};

export default Events;
