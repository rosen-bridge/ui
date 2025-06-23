'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  NewPagination,
  SmartSearch,
  SortField,
  DataLayout,
  useCollection,
  useSnackbar,
  useBreakpoint,
} from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import { serializeError } from 'serialize-error';
import useSWR from 'swr';

import { ApiEventResponse } from '@/_types';

import { filters, sorts } from './config';
import { Details } from './details';

const Events = () => {
  const dense = useBreakpoint('laptop-down');

  const { openSnackbar } = useSnackbar();

  const [current, setCurrent] = useState<ApiEventResponse['items'][0]>();

  const collection = useCollection();

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
      <div
        style={{
          flexGrow: '1',
          height: '200vh',
          background: 'white',
          padding: '16px',
          borderRadius: '16px',
        }}
      >
        {data?.items.map((item) => (
          <h1 key={item.id} onClick={() => setCurrent(item)}>
            {item.id}
          </h1>
        ))}
      </div>
    </DataLayout>
  );
};

export default Events;
