'use client';

/**
 * TODO: Convert this page to SSR mode
 * local:ergo/rosen-bridge/ui#307
 */
import { useCallback, useMemo } from 'react';

import {
  Amount,
  DataLayout,
  Network,
  NewPagination,
  SmartSearch,
  TableGrid,
  SortField,
  Token,
  useBreakpoint,
  useCollection,
} from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';
import { fetcher } from '@rosen-ui/swr-helpers';
import { getAddressUrl, getDecimalString, getTokenUrl } from '@rosen-ui/utils';
import useSWR from 'swr';

import { ApiAssetsResponse, Assets as AssetType } from '@/types/api';

import { LOCK_ADDRESSES } from '../../../configs';
import AssetRowDetails from './AssetRowDetails';
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
    <>
      <DataLayout
        search={renderSearch()}
        sort={renderSort()}
        sidebar={null}
        pagination={renderPagination()}
      >
        <TableGrid<AssetType>
          data={data?.items || []}
          isLoading={isLoading}
          gridTemplateColumns="repeat(2,1fr)"
          overrides={{
            tablet: { gridTemplateColumns: 'repeat(3,1fr)' },
            laptop: { gridTemplateColumns: 'repeat(4,1fr)' },
            desktop: { gridTemplateColumns: 'repeat(6,1fr)' },
          }}
          dataMap={[
            {
              key: 'name',
              title: 'Name',
              render: (item) => {
                const tokenUrl =
                  !item.isNative &&
                  getTokenUrl(
                    item.chain,
                    item.chain == NETWORKS.cardano.key
                      ? item.id.replace('.', '')
                      : item.id,
                  );
                return <Token name={item.name} href={tokenUrl || undefined} />;
              },
            },
            {
              key: 'network',
              title: 'Network',
              render: (item) => <Network name={item.chain} />,
            },
            {
              key: 'locked',
              title: 'Locked',
              render: (item) => {
                const hot = item.lockedPerAddress?.find((item) =>
                  Object.values(LOCK_ADDRESSES).includes(item.address),
                );
                const cold = item.lockedPerAddress?.find(
                  (item) =>
                    !Object.values(LOCK_ADDRESSES).includes(item.address),
                );
                return (
                  <Amount
                    value={getDecimalString(
                      ((hot?.amount || 0) + (cold?.amount || 0)).toString(),
                      item.significantDecimals,
                    )}
                  />
                );
              },
              overrides: {
                mobile: { style: { display: 'none' } },
                tablet: { style: { display: 'block' } },
              },
            },
            {
              key: 'hot',
              title: 'Hot',
              render: (item) => {
                const hot = item.lockedPerAddress?.find((item) =>
                  Object.values(LOCK_ADDRESSES).includes(item.address),
                );
                const hotUrl =
                  getAddressUrl(item.chain, hot?.address) ?? undefined;
                return (
                  <Amount
                    value={getDecimalString(
                      (hot?.amount || 0).toString(),
                      item.significantDecimals,
                    )}
                    href={hotUrl}
                  />
                );
              },
              overrides: {
                mobile: { style: { display: 'none' } },
                desktop: { style: { display: 'block' } },
              },
            },
            {
              key: 'cold',
              title: 'Cold',
              render: (item) => {
                const cold = item.lockedPerAddress?.find(
                  (item) =>
                    !Object.values(LOCK_ADDRESSES).includes(item.address),
                );
                const coldUrl =
                  getAddressUrl(item.chain, cold?.address) ?? undefined;

                return (
                  <Amount
                    value={getDecimalString(
                      (cold?.amount || 0).toString(),
                      item.significantDecimals,
                    )}
                    href={coldUrl}
                  />
                );
              },
              overrides: {
                mobile: { style: { display: 'none' } },
                desktop: { style: { display: 'block' } },
              },
            },
            {
              key: 'bridged',
              title: 'Bridged',
              render: (item) => (
                <Amount
                  value={getDecimalString(
                    item.bridged || '0',
                    item.significantDecimals,
                  )}
                />
              ),
              overrides: {
                mobile: { style: { display: 'none' } },
                laptop: { style: { display: 'block' } },
              },
            },
          ]}
          renderDetails={(item, expanded) => (
            <AssetRowDetails row={item} expanded={expanded} />
          )}
        />
      </DataLayout>
    </>
  );
};

export default Assets;
