'use client';

import {
  Box,
  EnhancedTable,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TablePaginationProps,
  Typography,
  useTableDataPagination,
} from '@rosen-bridge/ui-kit';
import { MouseEvent, useCallback, useMemo, useState } from 'react';

import { ApiAssetsResponse, Assets } from '@/_types/api';

import { MobileRow, TabletRow, tabletHeader } from './TableRow';
import TableSkeleton from './TableSkeleton';

const getKey = (chain: string) => (offset: number, limit: number) => {
  return [
    '/v1/assets',
    { offset, limit, chain: chain == 'all' ? undefined : chain },
  ];
};

export default function Page() {
  const [network, setNetwork] = useState('all');

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
  } = useTableDataPagination<ApiAssetsResponse>(getKey(network));

  const handleChangeNetwork = (event: any) => {
    setNetwork(event.target.value as string);
  };

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
    (rowData: Assets) => <MobileRow {...rowData} isLoading={isLoading} />,
    [isLoading],
  );

  const renderTabletRow = useCallback(
    (rowData: Assets) => <TabletRow {...rowData} isLoading={isLoading} />,
    [isLoading],
  );

  const tableHeaderProps = useMemo(
    () => ({
      mobile: [],
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
      <Grid
        container
        spacing={2}
        alignItems={{ mobile: 'stretch', tablet: 'center' }}
        justifyContent="space-between"
        direction={{ mobile: 'column-reverse', tablet: 'row' }}
      >
        <Grid item>
          <Box
            bgcolor={{ mobile: '#F5D4CA', tablet: 'transparent' }}
            borderRadius="12px 12px 0 0"
            padding={{ mobile: 2, tablet: 0 }}
          >
            <Typography variant="h2">List of Locked Assets</Typography>
            <Typography variant="body2">
              Showing {paginationProps.page * paginationProps.rowsPerPage + 1}{' '}
              to{' '}
              {isLastPage
                ? paginationProps.count
                : paginationProps.page * paginationProps.rowsPerPage +
                  paginationProps.rowsPerPage}{' '}
              of {paginationProps.count} Entries{' '}
            </Typography>
          </Box>
        </Grid>
        <Grid item width={{ mobile: '100%', tablet: '200px', laptop: '240px' }}>
          <FormControl fullWidth>
            <InputLabel>Network</InputLabel>
            <Select
              value={network}
              label="Network"
              onChange={handleChangeNetwork}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="bitcoin">Bitcoin</MenuItem>
              <MenuItem value="cardano">Cardano</MenuItem>
              <MenuItem value="ergo">Ergo</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      {isFirstLoad && (
        <Grid>
          <TableSkeleton numberOfItems={pageSize} />
        </Grid>
      )}
      {!isFirstLoad && data && (
        <EnhancedTable
          data={data.items}
          responsiveHead={tableHeaderProps}
          responsiveRenderRow={tableRenderRowProps}
          paginated={true}
          tablePaginationProps={paginationProps}
        />
      )}
    </>
  );
}
