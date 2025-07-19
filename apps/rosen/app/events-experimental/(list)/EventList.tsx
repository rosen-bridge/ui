'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  NewPagination,
  SmartSearch,
  SortField,
  DataLayout,
  useCollection,
  useSnackbar,
  useBreakpoint,
  styled,
  EmptyState,
} from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import { serializeError } from 'serialize-error';
import useSWR from 'swr';

import { useTokenMap } from '@/_hooks';
import { ApiEventResponse, EventItem } from '@/_types';

import { getFilters, sorts } from './config';
import { EventCard } from './EventCard';
import { EventListSidebar } from './EventListSidebar';

const Container = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1.2),
  width: '100%',
  gridTemplateColumns: 'repeat(auto-fill, minmax(242px, 1fr))',
}));

export const EventList = () => {
  const dense = useBreakpoint('laptop-down');

  const { openSnackbar } = useSnackbar();

  const [current, setCurrent] = useState<EventItem>();

  const collection = useCollection();

  const tokenMap = useTokenMap();

  const filters = useMemo(() => getFilters(tokenMap), [tokenMap]);

  const { data, error, isLoading } = useSWR<ApiEventResponse>(
    collection.params && ['/v1/events', collection.params],
    fetcher,
    {
      keepPreviousData: true,
    },
  );

  const renderPagination = useCallback(
    () => (
      <NewPagination
        disabled={isLoading}
        total={data?.total}
        pageSize={collection.pageSize}
        pageIndex={collection.pageIndex}
        onPageIndexChange={collection.setPageIndex}
        onPageSizeChange={collection.setPageSize}
      />
    ),
    [data, isLoading, collection],
  );

  const renderSearch = useCallback(
    () => (
      <SmartSearch
        disabled={isLoading}
        namespace="events"
        filters={filters}
        onChange={collection.setFilters}
      />
    ),
    [isLoading, collection],
  );

  const renderSidebar = useCallback(
    () => (
      <EventListSidebar value={current} onClose={() => setCurrent(undefined)} />
    ),
    [current],
  );

  const renderSort = useCallback(
    () => (
      <SortField
        defaultKey="timestamp"
        defaultOrder="DESC"
        dense={dense}
        disabled={isLoading}
        value={collection.sort}
        options={sorts}
        onChange={collection.setSort}
      />
    ),
    [dense, isLoading, collection],
  );

  useEffect(() => {
    setCurrent(undefined);
  }, [collection.sort, collection.filters, collection.pageIndex]);

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
    >
      {isLoading ? (
        <Container>
          {Array.from({ length: 5 }).map((_, i) => (
            <EventCard key={i} isLoading />
          ))}
        </Container>
      ) : data?.items && data.items.length >= 1 ? (
        <Container>
          {data.items.map((item) => (
            <EventCard
              active={current?.id === item.id}
              item={item}
              key={item.id}
              onClick={() => setCurrent(item)}
            />
          ))}
        </Container>
      ) : (
        <EmptyState />
      )}
    </DataLayout>
  );
};
