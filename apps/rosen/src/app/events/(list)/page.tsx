'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  DataLayout,
  EmptyState,
  EventCard,
  GridContainer,
  Pagination,
  SmartSearch,
  SortField,
  useBreakpoint,
  useCollection,
  useSnackbar,
} from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import { getDecimalString } from '@rosen-ui/utils';
import { serializeError } from 'serialize-error';
import useSWR from 'swr';

import { useTokenMap } from '@/hooks';
import { ApiEventResponse, EventItem } from '@/types';

import { getFilters, sorts } from './config';
import { EventSidebar } from './EventSidebar';

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

  const items = useMemo(() => {
    if (!isLoading) return data?.items || [];
    return Array(collection.pageSize).fill({});
  }, [collection.pageSize, data, isLoading]);

  const renderPagination = useCallback(
    () => (
      <Pagination
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
        <EmptyState style={{ height: 'calc(100vh - 288px)' }} />
      ) : (
        <GridContainer gap="8px" minWidth="242px">
          {items.map((item, index) => (
            <EventCard
              key={item.id ? `${item.id}:${item.eventTriggerId}` : index}
              active={!isLoading && current === item}
              isLoading={isLoading}
              value={
                !item
                  ? undefined
                  : {
                      amount: getDecimalString(
                        item.amount,
                        item.lockToken?.significantDecimals,
                      ),
                      fromChain: item.fromChain,
                      href: `/events/${item.eventId}`,
                      id: item.eventId,
                      status: item.status,
                      toChain: item.toChain,
                      token: item.lockToken?.name,
                      timestamp: item.timestamp,
                    }
              }
              onClick={() => setCurrent(item)}
            />
          ))}
        </GridContainer>
      )}
    </DataLayout>
  );
};

export default Page;
