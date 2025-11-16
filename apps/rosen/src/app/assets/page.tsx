'use client';

/**
 * TODO: Convert this page to SSR mode
 * local:ergo/rosen-bridge/ui#307
 */
import React, { useCallback, useMemo, useState } from 'react';

import {
  DataLayout,
  Pagination,
  SmartSearch,
  SortField,
  useBreakpoint,
  useCollection,
  ViewType,
  ViewToggle,
  EmptyState,
} from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import useSWR from 'swr';

import { ApiAssetsResponse } from '@/types/api';

import { filters, sorts } from './config';
import { AssetsFullData, getFullAssetData } from './getFullAssetData';
import { ViewGrid } from './ViewGrid';
import { ViewGridSidebar } from './ViewGridSidebar';
import { ViewRow } from './ViewRow';

const Assets = () => {
  const dense = useBreakpoint('laptop-down');

  const collection = useCollection();

  const [view, setView] = useState<ViewType>('row');

  const [current, setCurrent] = useState<AssetsFullData>();

  const { data, isLoading } = useSWR<ApiAssetsResponse>(
    collection.params && ['/v1/assets', collection.params],
    fetcher,
    {
      keepPreviousData: true,
      refreshInterval: 0,
    },
  );

  const items = useMemo(() => {
    if (!isLoading) {
      return (data?.items || []).map((item) => getFullAssetData(item));
    }
    return Array(collection.pageSize).fill({});
  }, [collection.pageSize, data, isLoading]);

  const renderPagination = useCallback(
    () => (
      <Pagination
        defaultPageSize={25}
        pageSizeOptions={[10, 25, 50, 100]}
        disabled={isLoading}
        total={data?.total}
        pageSize={collection.pageSize}
        pageIndex={collection.pageIndex}
        onPageIndexChange={collection.setPageIndex}
        onPageSizeChange={collection.setPageSize}
      />
    ),
    [collection, data, isLoading],
  );

  const renderSearch = useCallback(
    () => (
      <SmartSearch
        disabled={isLoading}
        namespace="assets"
        filters={filters}
        onChange={collection.setFilters}
      />
    ),
    [collection, isLoading],
  );

  const renderSort = useCallback(
    () => (
      <SortField
        defaultKey="name"
        defaultOrder="DESC"
        dense={dense}
        disabled={isLoading}
        value={collection.sort}
        options={sorts}
        onChange={collection.setSort}
      />
    ),
    [collection, dense, isLoading],
  );

  const renderSidebar = useCallback(() => {
    if (view !== 'grid') return null;
    return (
      <ViewGridSidebar value={current} onClose={() => setCurrent(undefined)} />
    );
  }, [current, view]);

  const renderView = useCallback(
    () => (
      <ViewToggle defaultView="row" onChangeView={(value) => setView(value)} />
    ),
    [setView],
  );

  return (
    <DataLayout
      search={renderSearch()}
      sort={renderSort()}
      sidebar={renderSidebar()}
      pagination={renderPagination()}
      view={renderView()}
    >
      {!isLoading && !items.length && (
        <EmptyState style={{ height: 'calc(100vh - 288px)' }} />
      )}
      {view === 'grid' && !!items.length && (
        <ViewGrid
          current={current}
          items={items}
          isLoading={isLoading}
          setCurrent={setCurrent}
        />
      )}
      {view === 'row' && !!items.length && (
        <ViewRow
          current={current}
          items={items}
          isLoading={isLoading}
          setCurrent={setCurrent}
        />
      )}
    </DataLayout>
  );
};

export default Assets;
