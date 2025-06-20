'use client';

import { useCallback } from 'react';

import {
  NewPagination,
  SmartSearch,
  SortField,
  DataLayout,
  useDataFetcher,
  useStickyBox,
} from '@rosen-bridge/ui-kit';

import { ApiEventResponse } from '@/_types';

import { defaultSort, filters, sorts } from './config';

const Events = () => {
  const dataTable = useDataFetcher<ApiEventResponse>({
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
    <DataLayout
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
    </DataLayout>
  );
};

export default Events;
