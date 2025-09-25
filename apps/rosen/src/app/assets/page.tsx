'use client';

/**
 * TODO: Convert this page to SSR mode
 * local:ergo/rosen-bridge/ui#307
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
  DataLayout,
  NewPagination,
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

import { useTokenMap } from '@/hooks';
import { ApiAssetsResponse, Assets as AssetType } from '@/types/api';

import { AssetGridDetails } from './AssetGridDetails';
import { getFilters, sorts } from './config';
import { GridView, RowView } from './views';

const Assets = () => {
  const dense = useBreakpoint('laptop-down');

  const collection = useCollection();

  const tokenMap = useTokenMap();

  const filters = useMemo(() => getFilters(tokenMap), [tokenMap]);

  const [activeView, setActiveView] = useState<ViewType>('row');

  const [current, setCurrent] = useState<AssetType>();

  const { data, isLoading } = useSWR<ApiAssetsResponse>(
    collection.params && ['/v1/assets', collection.params],
    fetcher,
    {
      keepPreviousData: true,
    },
  );

  const items = useMemo(() => {
    if (!isLoading) return data?.items || [];
    return Array(collection.pageSize).fill({});
  }, [collection.pageSize, data, isLoading]);

  const renderPagination = useCallback(
    () => (
      <NewPagination
        defaultPageSize={10}
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
    [collection, filters, isLoading],
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

  const renderSidebar = useCallback(
    () =>
      activeView == 'grid' ? (
        <AssetGridDetails
          item={current}
          onClose={() => setCurrent(undefined)}
        />
      ) : null,
    [current, activeView],
  );

  const renderView = useCallback(
    () => <ViewToggle onChangeView={(value) => setActiveView(value)} />,
    [setActiveView],
  );

  useEffect(() => {
    console.log(items);
  }, [items, isLoading]);
  return (
    <DataLayout
      search={renderSearch()}
      sort={renderSort()}
      sidebar={renderSidebar()}
      pagination={renderPagination()}
    >
      {!isLoading && !items.length ? (
        <EmptyState style={{ height: 'calc(100vh - 288px)' }} />
      ) : activeView === 'row' ? (
        <RowView items={items} isLoading={isLoading} />
      ) : (
        <GridView
          items={items}
          isLoading={isLoading}
          current={current}
          setCurrent={setCurrent}
        />
      )}
    </DataLayout>
  );
};

export default Assets;
