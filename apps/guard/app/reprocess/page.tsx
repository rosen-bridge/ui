'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  DataLayout,
  EmptyState,
  GridContainer,
  Pagination,
  SmartSearch,
  SortField,
  useBreakpoint,
  useCollection,
} from '@rosen-bridge/ui-kit';
import { Network } from '@rosen-ui/types';

import { getFilters, sorts } from './config';
import { ReprocessCard } from './ReprocessCard';
import { ReprocessDetails } from './ReprocessDetails';

export type ReprocessRequest = {
  id: string;
  eventId: string;
  timestamp: number;
  type: 'INCOMING' | 'OUTGOING';
  status?: 'ACCEPTED';
  sender?: string;
  submissions?: number;
  acceptances?: number;
  receivers?: string[];
  event: {
    status: 'successful';
    token: string;
    amount: number;
    fromChain: Network;
    toChain: Network;
  };
};

export const REQUEST_TYPE = {
  INCOMING: 'Incoming',
  OUTGOING: 'Outgoing',
};

export const REQUEST_STATUS = {
  ACCEPTED: 'Accepted',
};

const Reprocess = () => {
  const dense = useBreakpoint('laptop-down');

  const collection = useCollection();

  const [current, setCurrent] = useState<ReprocessRequest>();

  const filters = useMemo(() => getFilters(), []);

  const { data, isLoading, total } = useMemo(() => {
    const reprocessRequests: ReprocessRequest[] = [
      {
        id: '39ea8e6ac3113d1b',
        eventId:
          '20dae02b01ab75f435be6813b1d2908e39ea8e6ac3113d1b125b211fb85eb0ab',
        type: 'INCOMING',
        timestamp: 1762426234000,
        status: 'ACCEPTED',
        sender: 'Guard Ipsum',
        event: {
          status: 'successful',
          token: 'PALM',
          amount: 2000.15,
          fromChain: 'ergo',
          toChain: 'binance',
        },
      },
      {
        id: '6813b1d1ab75f430',
        eventId:
          'd1b435be601ab75f6ac3113908e39ea8e125b211fb85eb0ab813b1d220dae02b',
        type: 'OUTGOING',
        timestamp: 1718054902000,
        submissions: 6,
        acceptances: 5,
        receivers: [
          'Guard Ipsum',
          'Guard Lorem',
          'Guard Dolore',
          'Guard Veniam',
        ],
        event: {
          status: 'successful',
          token: 'PALM',
          amount: 2000.15,
          fromChain: 'ergo',
          toChain: 'ethereum',
        },
      },
    ];
    return {
      data: reprocessRequests,
      isLoading: false,
      total: 78,
    };
  }, []);

  const renderPagination = useCallback(
    () => (
      <Pagination
        defaultPageSize={25}
        pageSizeOptions={[25, 50, 100]}
        disabled={isLoading}
        total={total}
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
      <ReprocessDetails value={current} onClose={() => setCurrent(undefined)} />
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

  return (
    <DataLayout
      search={renderSearch()}
      sort={renderSort()}
      sidebar={renderSidebar()}
      pagination={renderPagination()}
    >
      {!isLoading && !data.length ? (
        <EmptyState style={{ height: 'calc(100vh - 288px)' }} />
      ) : (
        <GridContainer gap="8px" minWidth="242px">
          {data.map((item) => (
            <ReprocessCard
              key={item.id}
              value={item}
              active={!isLoading && current?.id === item.id}
              isLoading={isLoading}
              onClick={() => setCurrent(item)}
            />
          ))}
        </GridContainer>
      )}
    </DataLayout>
  );
};

export default Reprocess;
