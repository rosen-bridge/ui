'use client';

/**
 * TODO: Convert this page to SSR mode
 * local:ergo/rosen-bridge/ui#307
 */
import { useCallback, useMemo } from 'react';

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
  Skeleton,
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
      <TableGrid
        gridTemplateColumns="repeat(2,1fr) auto"
        overrides={{
          tablet: { gridTemplateColumns: 'repeat(3,1fr) auto' },
          laptop: { gridTemplateColumns: 'repeat(4,1fr) auto' },
          desktop: { gridTemplateColumns: 'repeat(6,1fr) auto' },
        }}
      >
        <TableGridHead>
          <TableGridHeadCol>Name</TableGridHeadCol>
          <TableGridHeadCol>Network</TableGridHeadCol>
          <TableGridHeadCol
            overrides={{
              mobile: { style: { display: 'none' } },
              tablet: { style: { display: 'block' } },
            }}
          >
            Locked
          </TableGridHeadCol>
          <TableGridHeadCol
            overrides={{
              mobile: { style: { display: 'none' } },
              desktop: { style: { display: 'block' } },
            }}
          >
            Hot
          </TableGridHeadCol>
          <TableGridHeadCol
            overrides={{
              mobile: { style: { display: 'none' } },
              desktop: { style: { display: 'block' } },
            }}
          >
            Cold
          </TableGridHeadCol>
          <TableGridHeadCol
            overrides={{
              mobile: { style: { display: 'none' } },
              laptop: { style: { display: 'block' } },
            }}
          >
            Bridged
          </TableGridHeadCol>
        </TableGridHead>
        {!isLoading
          ? data?.items.map((item, index) => (
              <AssetRow key={index} item={item} />
            ))
          : Array(collection.pageSize)
              .fill(0)
              .map((_, index) => (
                <Skeleton
                  variant="rounded"
                  height={50}
                  sx={{ gridColumn: '1/-1' }}
                  key={index}
                />
              ))}
      </TableGrid>
    </DataLayout>
  );
};

export default Assets;
