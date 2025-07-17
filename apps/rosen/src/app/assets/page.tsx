'use client';

/**
 * TODO: Convert this page to SSR mode
 * local:ergo/rosen-bridge/ui#307
 */
import { MouseEvent, useCallback, useMemo, useState } from 'react';

import {
  Box,
  EnhancedTable,
  Grid,
  MenuItem,
  Paper,
  TablePaginationProps,
  TextField,
  Typography,
  useTableDataPagination,
} from '@rosen-bridge/ui-kit';
import { NETWORKS, NETWORKS_KEYS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';

import { ApiAssetsResponse, Assets as AssetsModel } from '@/types/api';

import { MobileRow, TabletRow, mobileHeader, tabletHeader } from './TableRow';
import { TableSkeleton } from './TableSkeleton';

const getKey = (chain: Network | 'all') => (offset: number, limit: number) => {
  return [
    '/v1/assets',
    { offset, limit, chain: chain == 'all' ? undefined : chain },
  ];
};

const Assets = () => {
  const [network, setNetwork] = useState<Network | 'all'>('all');

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
    setNetwork(event.target.value);
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
    (rowData: AssetsModel) => (
      <MobileRow key={rowData.id} {...rowData} isLoading={isLoading} />
    ),
    [isLoading],
  );

  const renderTabletRow = useCallback(
    (rowData: AssetsModel) => (
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
      <Grid
        alignItems={{ mobile: 'stretch', tablet: 'center' }}
        container
        direction={{ mobile: 'column-reverse', tablet: 'row' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ marginBottom: 2 }}
      >
        <Grid item>
          <Box
            bgcolor={(theme) => ({
              mobile: theme.palette.secondary.light,
              tablet: 'transparent',
            })}
            borderRadius={(theme) =>
              `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`
            }
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
          <TextField
            select
            label="Network"
            fullWidth
            onChange={handleChangeNetwork}
            value={network}
          >
            <MenuItem value="all">All</MenuItem>
            {NETWORKS_KEYS.map((key) => (
              <MenuItem key={key} value={key}>
                {NETWORKS[key].label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>
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

export default Assets;
