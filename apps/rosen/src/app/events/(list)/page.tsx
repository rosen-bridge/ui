'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  DataLayout,
  EmptyState,
  GridContainer,
  NewPagination,
  SmartSearch,
  SortField,
  useBreakpoint,
  useCollection,
  useSnackbar,
} from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import { serializeError } from 'serialize-error';
import useSWR from 'swr';

import { getFilters, sorts } from '@/app/events/(list)/config';
import { EventCard } from '@/app/events/(list)/EventCard';
import { EventSidebar } from '@/app/events/(list)/EventSidebar';
import { useTokenMap } from '@/hooks';
import { ApiEventResponse, EventItem } from '@/types';

 const Page = () => {
  const dense = useBreakpoint('laptop-down');

  const { openSnackbar } = useSnackbar();

  const collection = useCollection();

  const tokenMap = useTokenMap();

  const [current, setCurrent] = useState<EventItem>();

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
        defaultPageSize={25}
        pageSizeOptions={[25, 50, 100]}
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
        namespace="events"
        filters={filters}
        onChange={collection.setFilters}
      />
    ),
    [collection, filters, isLoading],
  );

  const renderSidebar = useCallback(
    () => (
      <EventSidebar value={current} onClose={() => setCurrent(undefined)} />
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
    [collection, dense, isLoading],
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
      {!isLoading && !data?.items.length ? (
        <EmptyState />
      ) : (
        <GridContainer gap="8px" minWidth="242px">
          {isLoading
            ? [...Array(collection.pageSize)].map((_, i) => (
                <EventCard key={i} isLoading />
              ))
            : data?.items.map((item) => (
                <EventCard
                  active={current?.id === item.id}
                  item={item}
                  key={item.id}
                  onClick={() => setCurrent(item)}
                />
              ))}
        </GridContainer>
      )}
    </DataLayout>
  );
};

export default Page;
