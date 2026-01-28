'use client';

/**
 * TODO: Convert this page to SSR mode
 * local:ergo/rosen-bridge/ui#307
 */
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

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
  useSnackbar,
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
  const searchParams = useSearchParams();

  const router = useRouter();

  const pathname = usePathname();

  const dense = useBreakpoint('laptop-down');

  const { openSnackbar } = useSnackbar();

  const collection = useCollection({
    searchParams: searchParams.toString(),
    defaultPageIndex: 0,
    defaultPageSize: 25,
    defaultSortField: 'name',
    defaultSortOrder: 'DESC',
  });

  const [view, setView] = useState<ViewType>('row');

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
  }, [collection.pageSize, data, isLoading]);

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
    [collection, data, isLoading],
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
    [collection, isLoading],
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

  useEffect(() => {
    if (collection.query === searchParams.toString()) return;

    const url = collection.query ? `${pathname}?${collection.query}` : pathname;

    router.replace(url, { scroll: false });
  }, [collection.query, pathname, router, searchParams]);

  useEffect(() => {
    setCurrent(undefined);
  }, [collection.sort, collection.fields, collection.pageIndex]);

  useEffect(() => {
    if (error) {
      openSnackbar(error.message, 'error', undefined, () =>
        JSON.stringify(serializeError(error), null, 2),
      );
    }
  }, [error]);

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
