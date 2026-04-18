'use client';

/**
 * TODO: Convert this page to SSR mode
 * local:ergo/rosen-bridge/ui#307
 */
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  LayoutList,
  Pagination,
  SmartSearch,
  SortField,
  useBreakpoint,
  useCollection,
  ViewToggle,
  EmptyState,
  useToast,
} from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import { serializeError } from 'serialize-error';
import useSWR from 'swr';

import { ApiAssetsResponse } from '@/types/api';

import { filters, sorts } from './config';
import { AssetsFullData, getFullAssetData } from './getFullAssetData';
import { ViewGrid } from './ViewGrid';
import { ViewGridSidebar } from './ViewGridSidebar';
import { ViewRow } from './ViewRow';

const Assets = () => {
  const dense = useBreakpoint('laptop-down');

  const toast = useToast();

  const collection = useCollection({
    defaultPageIndex: 0,
    defaultPageSize: 25,
    defaultSortField: 'name',
    defaultSortOrder: 'DESC',
    defaultView: 'grid',
    localStorageKey: 'assets',
  });

  const [current, setCurrent] = useState<AssetsFullData>();

  const { data, error, isLoading } = useSWR<ApiAssetsResponse>(
    collection.query && `/v1/assets?${collection.query}`,
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
  }, [collection.pageSize, data?.items, isLoading]);

  const renderPagination = useCallback(
    () => (
      <Pagination
        pageSizeOptions={[10, 25, 50, 100]}
        disabled={isLoading}
        total={data?.total}
        pageSize={collection.pageSize}
        pageIndex={collection.pageIndex}
        onPageIndexChange={collection.setPageIndex}
        onPageSizeChange={collection.setPageSize}
      />
    ),
    [
      collection.pageSize,
      collection.pageIndex,
      collection.setPageIndex,
      collection.setPageSize,
      data?.total,
      isLoading,
    ],
  );

  const renderSearch = useCallback(
    () => (
      <SmartSearch
        disabled={isLoading}
        namespace="assets"
        options={filters}
        value={collection.fields}
        onChange={collection.setFields}
      />
    ),
    [collection.fields, collection.setFields, isLoading],
  );

  const renderSort = useCallback(
    () => (
      <SortField
        dense={dense}
        disabled={isLoading}
        value={collection.sort}
        options={sorts}
        onChange={collection.setSort}
      />
    ),
    [collection.sort, collection.setSort, dense, isLoading],
  );

  const renderSidebar = useCallback(() => {
    if (collection.view !== 'grid') return null;
    return (
      <ViewGridSidebar value={current} onClose={() => setCurrent(undefined)} />
    );
  }, [current, collection.view]);

  const renderView = useCallback(
    () => (
      <ViewToggle
        disabled={isLoading}
        value={collection.view}
        onChange={(value) => collection.setView(value)}
      />
    ),
    [collection.view, isLoading],
  );

  useEffect(() => {
    items && collection.scrollIntoView();
  }, [collection.scrollIntoView, items]);

  useEffect(() => {
    if (!collection.fragment) return;

    const item = items.find((item) => item.id === collection.fragment);

    if (!item) return;

    setCurrent(item);
  }, [collection.fragment, items]);

  useEffect(() => {
    if (current?.id) {
      collection.setFragment(current.id);
    }
  }, [collection.setFragment, current?.id]);

  useEffect(() => {
    setCurrent(undefined);
  }, [collection.sort, collection.fields, collection.pageIndex]);

  useEffect(() => {
    if (error) {
      toast.add({
        type: 'error',
        description: error.message,
        more: () => JSON.stringify(serializeError(error), null, 2)
      })
    }
  }, [error]);

  return (
    <LayoutList
      search={renderSearch()}
      sort={renderSort()}
      sidebar={renderSidebar()}
      pagination={renderPagination()}
      view={renderView()}
    >
      {!isLoading && !items.length && <EmptyState style={{ height: '100%' }} />}
      {collection.view === 'grid' && !!items.length && (
        <ViewGrid
          current={current}
          items={items}
          isLoading={isLoading}
          setCurrent={setCurrent}
        />
      )}
      {collection.view === 'row' && !!items.length && (
        <ViewRow
          current={current}
          items={items}
          isLoading={isLoading}
          setCurrent={setCurrent}
        />
      )}
    </LayoutList>
  );
};

export default Assets;
