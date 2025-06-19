'use client';

import { useCallback } from 'react';
import { useStickyBox } from 'react-sticky-box';

import {
  Grid,
  NewPagination,
  SmartSearch,
  SortField,
  useDataTable,
} from '@rosen-bridge/ui-kit';

import { ApiEventResponse } from '@/_types';

import { defaultSort, filters, sorts } from './config';

const TableLayout = ({ children, pagination, search, sidebar, sort }: any) => {
  return (
    <Grid container gap={(theme) => theme.spacing(2)}>
      <Grid item mobile={12}>
        <Grid container gap={(theme) => theme.spacing(2)}>
          <Grid flexGrow={1}>{search}</Grid>
          <Grid flexBasis="auto">{sort}</Grid>
        </Grid>
      </Grid>
      <Grid item mobile={12}>
        <Grid container gap={(theme) => theme.spacing(2)}>
          <Grid item flexGrow={1}>
            <Grid container gap={(theme) => theme.spacing(2)}>
              <Grid item mobile={12}>
                {children}
              </Grid>
              <Grid item mobile={12}>
                {pagination}
              </Grid>
            </Grid>
          </Grid>
          <Grid item>{sidebar}</Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

const Events = () => {
  const dataTable = useDataTable<ApiEventResponse>({
    baseUrl: process.env.API_BASE_URL,
    api: '/v1/events',
  });

  const stickyRef = useStickyBox({
    offsetTop: 16,
    offsetBottom: 16,
  });

  const renderPagination = useCallback(
    () => (
      <NewPagination
        disabled={dataTable.isLoading}
        total={dataTable.total}
        pageSize={dataTable.pageSize}
        pageIndex={dataTable.pageIndex}
        onPageIndexChange={dataTable.setPageIndex}
        onPageSizeChange={dataTable.setPageSize}
      />
    ),
    [dataTable],
  );

  const renderSearch = useCallback(
    () => (
      <SmartSearch
        disabled={dataTable.isLoading}
        namespace="events"
        filters={filters}
        onChange={(selected) => dataTable.setQuery(selected.query)}
      />
    ),
    [dataTable],
  );

  const renderSidebar = useCallback(
    () => (
      <div
        ref={stickyRef}
        style={{
          height: '120vh',
          background: 'white',
          width: '330px',
          padding: '16px',
          borderRadius: '16px',
        }}
      >
        sidebar
      </div>
    ),
    [stickyRef],
  );

  const renderSort = useCallback(
    () => (
      <SortField
        disabled={dataTable.isLoading}
        value={dataTable.sort}
        defaultValue={defaultSort}
        options={sorts}
        onChange={dataTable.setSort}
      />
    ),
    [dataTable],
  );

  return (
    <TableLayout
      search={renderSearch()}
      sort={renderSort()}
      sidebar={renderSidebar()}
      pagination={renderPagination()}
    >
      <div
        style={{
          flexGrow: '1',
          height: '200vh',
          background: 'white',
          padding: '16px',
          borderRadius: '16px',
        }}
      >
        {dataTable.items.map((item) => (
          <h1 key={item.id}>{item.id}</h1>
        ))}
      </div>
    </TableLayout>
  );
};

export default Events;
