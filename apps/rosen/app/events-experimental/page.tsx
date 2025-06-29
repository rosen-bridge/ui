'use client';

import React, { useCallback, useEffect, useState } from 'react';

import {
  NewPagination,
  SmartSearch,
  SortField,
  DataLayout,
  useCollection,
  useSnackbar,
  useBreakpoint,
  styled,
} from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import { serializeError } from 'serialize-error';
import useSWR from 'swr';

import { ApiEventResponse, EventItem } from '@/_types';
import EventCard from '@/events-experimental/EventCard';

import { filters, sorts } from './config';
import { Details } from './details';

interface DataContainerProps {
  variant?: 'grid' | 'row';
  bordered?: boolean;
}

const EventsContainer = styled('div')<DataContainerProps>(
  ({ theme, variant = 'grid' }) => ({
    display: variant === 'grid' ? 'grid' : 'flex',
    flexDirection: variant === 'row' ? 'column' : undefined,
    gap: theme.spacing(1.2),
    width: '100%',
    ...(variant === 'grid' && {
      gridTemplateColumns: 'repeat(1, 1fr)',
      [theme.breakpoints.up('tablet')]: {
        gridTemplateColumns: 'repeat(2, 1fr)',
      },
      [theme.breakpoints.up('laptop')]: {
        gridTemplateColumns: 'repeat(3, 1fr)',
      },
    }),
  }),
);
const Events = () => {
  const dense = useBreakpoint('laptop-down');

  const { openSnackbar } = useSnackbar();

  const [current, setCurrent] = useState<EventItem>();

  const [activeView, setActiveView] = useState<'grid' | 'row'>('grid');

  const collection = useCollection();
  useEffect(() => {
    console.log(current);
  }, [setCurrent]);
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
    () => <Details value={current} onClose={() => setCurrent(undefined)} />,
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
  const renderViewToggle = useCallback(
    () => <div></div>,
    [dense, isLoading, collection],
  );

  useEffect(() => {
    if (error) {
      openSnackbar(error.message, 'error', undefined, () =>
        JSON.stringify(serializeError(error), null, 2),
      );
    }
  }, [error]);
  console.log(data?.items[0]);
  return (
    <DataLayout
      search={renderSearch()}
      sort={renderSort()}
      sidebar={renderSidebar()}
      pagination={renderPagination()}
      viewToggle={renderViewToggle()}
    >
      <EventsContainer variant={activeView}>
        {data?.items.map((item) => (
          <EventCard
            onClick={() => setCurrent(item)}
            item={item}
            active={current?.id === item.id}
          />
        ))}
      </EventsContainer>
    </DataLayout>
  );
};

export default Events;
