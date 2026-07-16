'use client';

import { useCallback, useEffect, useMemo } from 'react';

import {
  EmptyState,
  LayoutList,
  Pagination,
  SmartSearch,
  SortField,
  useBreakpoint,
  useCollection,
  useToast,
  ViewToggle,
  ViewToggleType,
} from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import { Network } from '@rosen-ui/types';
import useSWR from 'swr';

import { ApiBalanceResponse } from '@/types/api';

import { filters, sorts } from './config';
import { ViewGrid } from './ViewGrid';
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

  const {
    data: DATA_API,
    error,
    isLoading,
  } = useSWR<ApiBalanceResponse>(
    collection.query && `/balance?${collection.query}`,
    fetcher,
    {
      keepPreviousData: true,
    },
  );

  const data = useMemo(() => {
    if (!DATA_API) return [];

    const items = [
      ...DATA_API.cold.items.map((item) => ({ ...item, type: 'cold' })),
      ...DATA_API.hot.items.map((item) => ({ ...item, type: 'hot' })),
    ];

    const grouped = Object.groupBy(
      items,
      (item) => `${item.chain}:${item.balance.tokenId}`,
    );

    return Object.values(grouped)
      .filter((group): group is NonNullable<typeof group> => !!group)
      .map((group) => {
        const coldItem = group.find((i) => i.type === 'cold');
        const hotItem = group.find((i) => i.type === 'hot');

        return {
          id: `${Math.random()}`,
          chain: (coldItem?.chain || hotItem?.chain) as Network,

          token: {
            id: hotItem?.balance.tokenId || coldItem?.balance.tokenId,
            decimals: hotItem?.balance.decimals ?? coldItem?.balance.decimals,
            name: hotItem?.balance.name ?? coldItem?.balance.name,
            isNativeToken:
              hotItem?.balance.isNativeToken ??
              coldItem?.balance.isNativeToken ??
              false,
          },

          cold: {
            address: coldItem?.address ?? '',
            amount: BigInt(coldItem?.balance.amount ?? 0),
          },

          hot: {
            address: hotItem?.address ?? '',
            amount: BigInt(hotItem?.balance.amount ?? 0),
          },
        };
      });
  }, [DATA_API]);

  const items = useMemo(() => {
    if (!isLoading) {
      return data || [];
    }
    return Array(collection.pageSize).fill({});
  }, [isLoading, data, collection.pageSize]);

  const current = useMemo(() => {
    return items.find(
      (item) => item.id && item.id.toString() === collection.fragment,
    );
  }, [collection.fragment, items]);

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
    [collection.fields, collection.setFields, filters, isLoading],
  );

  const renderPagination = useCallback(
    () => (
      <Pagination
        pageSizeOptions={[10, 25, 50, 100]}
        disabled={isLoading}
        total={data?.length}
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
      data.length,
      isLoading,
    ],
  );

  const renderView = useCallback(
    () => (
      <ViewToggle
        disabled={isLoading}
        value={collection.view}
        onChange={(value: ViewToggleType) => collection.setView(value)}
      />
    ),
    [collection.view, isLoading],
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

  useEffect(() => {
    if (error) {
      toast.add({
        type: 'error',
        description: error.message,
        more: () => JSON.stringify(error, null, 2),
      });
    }
  }, [error]);

  return (
    <LayoutList
      search={renderSearch()}
      sort={renderSort()}
      sidebar={null}
      pagination={renderPagination()}
      view={renderView()}
    >
      {!isLoading && !items.length && (
        <EmptyState style={{ height: 'calc(100vh - 288px)' }} />
      )}
      {collection.view === 'row' && !!items.length && (
        <ViewRow
          items={items}
          isLoading={isLoading}
          current={current}
          setCurrent={(item) => {
            item.id &&
              collection.setFragment(
                item.id === current?.id ? undefined : item.id.toString(),
              );
          }}
        />
      )}
      {collection.view === 'grid' && !!items.length && (
        <ViewGrid items={items} isLoading={isLoading} />
      )}
    </LayoutList>
  );
};

export default Assets;
