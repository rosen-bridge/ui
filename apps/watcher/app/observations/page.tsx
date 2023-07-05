'use client';
import { useCallback, useMemo, useState } from 'react';
import useSWR from 'swr';

import { EnhancedTable, Grid } from '@rosen-bridge/ui-kit';

import { MobileRow, TabletRow, mobileHeader, tabletHeader } from './TableRow';
import TableSkeleton from './TableSkeleton';

import { fetcher } from '@rosen-ui/swr-helpers';

import { ApiObservationResponse, Observation } from '@/_types/api';

type RowProps = Observation;

const useTableDataPagination = (
  getKey: typeof getKe,
  initialPageSize: number = 10,
  initialPageIndex: number = 0
) => {
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [pageIndex, setPageIndex] = useState<number>(initialPageIndex);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPageIndex(0);
  }, []);

  const { data, isLoading } = useSWR<ApiObservationResponse>(
    getKey(pageIndex * pageSize, pageSize),
    fetcher
  );

  return {
    isLoading,
    data,
    setPageSize: handlePageSizeChange,
    pageSize,
    pageIndex,
    setPageIndex,
  };
};

const getKe = (offset: number, limit: number) => {
  return ['/observation', { offset, limit }];
};

const Observations = () => {
  const { data, isLoading, pageIndex, pageSize, setPageIndex, setPageSize } =
    useTableDataPagination(getKe);

  const handleChangePage = useCallback(
    (event: unknown, newPage: number) => {
      setPageIndex(newPage);
    },
    [setPageIndex]
  );

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPageSize(parseInt(event.target.value, 10));
    },
    [setPageSize]
  );

  const renderMobileRow = useCallback(
    (rowData: Observation) => <MobileRow {...rowData} />,
    []
  );

  const renderTabletRow = useCallback(
    (rowData: Observation) => <TabletRow {...rowData} />,
    []
  );

  const tableHeaderProps = useMemo(
    () => ({
      mobile: mobileHeader,
      tablet: tabletHeader,
    }),
    []
  );

  const tableRenderRowProps = useMemo(
    () => ({
      mobile: renderMobileRow,
      tablet: renderTabletRow,
    }),
    [renderMobileRow, renderTabletRow]
  );

  const paginationProps = useMemo(
    () => ({
      rowsPerPageOptions: [5, 10, 25],
      component: 'div',
      count: data?.total ?? 0,
      rowsPerPage: pageSize,
      page: pageIndex,
      onPageChange: handleChangePage,
      onRowsPerPageChange: handleChangeRowsPerPage,
    }),
    [
      data?.total,
      pageIndex,
      pageSize,
      handleChangePage,
      handleChangeRowsPerPage,
    ]
  );

  return isLoading ? (
    <Grid>
      <TableSkeleton numberOfItems={pageSize} />
    </Grid>
  ) : (
    data && (
      <Grid container>
        <EnhancedTable
          data={data.items}
          responsiveHead={tableHeaderProps}
          responsiveRenderRow={tableRenderRowProps}
          paginated={true}
          tablePaginationProps={paginationProps}
        />
      </Grid>
    )
  );
};

export default Observations;
