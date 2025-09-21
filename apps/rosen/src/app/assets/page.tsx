'use client';

/**
 * TODO: Convert this page to SSR mode
 * local:ergo/rosen-bridge/ui#307
 */
import React, { useCallback, useMemo } from 'react';

import {
  DataLayout,
  NewPagination,
  SmartSearch,
  TableGrid,
  SortField,
  useBreakpoint,
  useCollection,
  TableGridHead,
  TableGridHeadCol,
  TableGridBody,
} from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import useSWR from 'swr';

import { ApiAssetsResponse } from '@/types/api';

import AssetRow from './AssetRow';
import { getFilters, sorts } from './config';

const Assets = () => {
  const dense = useBreakpoint('laptop-down');
  const collection = useCollection();
  const filters = useMemo(() => getFilters(), []);

  const { data, isLoading } = useSWR<ApiAssetsResponse>(
    collection.params && ['/v1/assets', collection.params],
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
      <NewPagination
        defaultPageSize={10}
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
        filters={filters}
        onChange={collection.setFilters}
      />
    ),
    [collection, filters, isLoading],
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
        // onChange={collection.setSort}
      />
    ),
    [collection, dense, isLoading],
  );

  return (
    <DataLayout
      search={renderSearch()}
      sort={renderSort()}
      sidebar={null}
      pagination={renderPagination()}
    >
      <TableGrid hasActionColumn>
        <TableGridHead>
          <TableGridHeadCol>Name</TableGridHeadCol>
          <TableGridHeadCol>Network</TableGridHeadCol>
          <TableGridHeadCol hideOn="tablet-down">Locked</TableGridHeadCol>
          <TableGridHeadCol hideOn="desktop-down">Hot</TableGridHeadCol>
          <TableGridHeadCol hideOn="desktop-down">Cold</TableGridHeadCol>
          <TableGridHeadCol hideOn="laptop-down">Bridged</TableGridHeadCol>
        </TableGridHead>
        <TableGridBody>
          {items.map((item) => (
            <AssetRow key={item.id} item={item} isLoading={isLoading} />
          ))}
        </TableGridBody>
      </TableGrid>
    </DataLayout>
  );
};

export default Assets;
