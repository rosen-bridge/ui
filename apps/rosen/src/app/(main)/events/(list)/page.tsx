'use client';

import { useCallback, useEffect, useMemo } from 'react';

import {
  EmptyState,
  EventCard,
  GridContainer,
  LayoutList,
  Pagination,
  SmartSearch,
  SortField,
  useBreakpoint,
  useCollection,
  useToast,
} from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';

import { serializeError } from 'serialize-error';
import useSWR from 'swr';

import { useTokenMap } from '@/hooks';
import type { ApiEventResponse } from '@/types';

import { getFilters, sorts } from './config';
import { Sidebar } from './Sidebar';

const Page = () => {
  const dense = useBreakpoint('laptop-down');

  const toast = useToast();

  const collection = useCollection({
    defaultPageIndex: 0,
    defaultPageSize: 25,
    defaultSortField: 'timestamp',
    defaultSortOrder: 'DESC',
  });

  const tokenMap = useTokenMap();

  const { data, error, isLoading } = useSWR<ApiEventResponse>(
    collection.query && `/v1/events?${collection.query}`,
    fetcher,
    {
      keepPreviousData: true,
    },
  );

  const items = useMemo(() => data?.items || [], [data?.items]);

  const filters = useMemo(() => getFilters(tokenMap), [tokenMap]);

  const current = useMemo(() => {
    return items.find((item) => item.id.toString() === collection.fragment);
  }, [collection.fragment, items]);

  const renderPagination = useCallback(
    () => (
      <Pagination
        pageSizeOptions={[25, 50, 100]}
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
        namespace="events"
        options={filters}
        value={collection.fields}
        onChange={collection.setFields}
      />
    ),
    [collection.fields, collection.setFields, filters, isLoading],
  );

  const renderSidebar = useCallback(
    () => (
      <Sidebar
        value={current}
        onClose={() => collection.setFragment(undefined)}
      />
    ),
    [current, collection.setFragment],
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
    items && collection.scrollIntoView();
  }, [collection.scrollIntoView, items]);

  useEffect(() => {
    if (error) {
      toast.add({
        type: 'error',
        description: error.message,
        more: () => JSON.stringify(serializeError(error), null, 2),
      });
    }
  }, [error, toast.add]);

  return (
    <LayoutList
      search={renderSearch()}
      sort={renderSort()}
      sidebar={renderSidebar()}
      pagination={renderPagination()}
    >
      {!isLoading && !items.length ? (
        <EmptyState style={{ height: 'calc(100vh - 288px)' }} />
      ) : (
        <GridContainer gap={1} minWidth="242px">
          {isLoading
            ? Array(collection.pageSize)
                .fill(null)
                .map((_, index) => <EventCard key={index.toString()} loading />)
            : items.map((item) => (
                <EventCard
                  id={item.id.toString()}
                  key={`${item.id}:${item.eventTriggerId}`}
                  active={current === item}
                  value={{
                    amount: item.amount,
                    decimal: item.lockToken?.significantDecimal,
                    fromChain: item.fromChain,
                    href: `/events/${item.eventId}`,
                    id: item.eventId,
                    status: item.status,
                    toChain: item.toChain,
                    token: item.lockToken?.id,
                    unit: item?.lockToken?.name,
                    timestamp: item.timestamp,
                  }}
                  onClick={() => collection.setFragment(item.id.toString())}
                />
              ))}
        </GridContainer>
      )}
    </LayoutList>
  );
};

export default Page;
