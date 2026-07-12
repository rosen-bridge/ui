'use client';

import { useCallback, useMemo, useState } from 'react';

import {
  Amount,
  EmptyState,
  Icon,
  IconButton,
  Identifier,
  Label,
  LayoutList,
  Pagination,
  TableGrid,
  TableGridBody,
  TableGridBodyDetails,
  TableGridCell,
  TableGridHeader,
  TableGridRow,
  Token,
  useBreakpoint,
  useCollection,
} from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import { getDecimalString } from '@rosen-ui/utils';
import useSWR from 'swr';

import { useERsnToken, useRsnToken } from '@/hooks';
import type { ApiRevenueResponse, Revenue } from '@/types/api';

const Revenues = () => {
  const collection = useCollection({
    defaultPageIndex: 0,
    defaultPageSize: 10,
  });

  const [current, setCurrent] = useState<Revenue>();

  const { rsnToken, isLoading: isRsnTokenLoading } = useRsnToken();
  const { eRsnToken, isLoading: isERsnTokenLoading } = useERsnToken();

  const { data, isLoading: isDataLoading } = useSWR<ApiRevenueResponse>(
    collection.query && `/revenue?${collection.query}`,
    fetcher,
    {
      keepPreviousData: true,
    },
  );

  const isLoading = isDataLoading || isRsnTokenLoading || isERsnTokenLoading;

  const items = useMemo(() => {
    if (!isLoading) return data?.items || [];
    return Array(collection.pageSize).fill({});
  }, [collection.pageSize, data?.items, isLoading]);

  const isTabletUp = useBreakpoint('tablet-up');

  const getRSNIncome = (item?: Revenue) => {
    if (!item?.revenues) return;

    const rsnTokenInfo = item.revenues.find(
      (token) => token.tokenId === rsnToken?.tokenId,
    );
    const eRsnTokenInfo = item.revenues.find(
      (token) => token.tokenId === eRsnToken?.tokenId,
    );

    const amount = [rsnTokenInfo, eRsnTokenInfo]
      .map((info) => getDecimalString(info?.amount, info?.decimals))
      .reduce((sum, amount) => sum + parseFloat(amount), 0)
      .toString();

    return amount;
  };

  const getTokenIncome = (item?: Revenue) => {
    if (!item?.revenues) return [];
    return item.revenues.filter(
      (token) =>
        token.tokenId !== rsnToken?.tokenId &&
        token.tokenId !== eRsnToken?.tokenId,
    );
  };

  const renderPagination = useCallback(
    () => (
      <Pagination
        pageSizeOptions={[10, 25, 50]}
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

  return (
    <LayoutList
      search={null}
      sort={null}
      sidebar={null}
      pagination={renderPagination()}
      view={null}
    >
      {!isLoading && !items.length && <EmptyState style={{ height: '100%' }} />}
      {!!items.length && (
        <TableGrid variant="separated">
          <TableGridHeader>
            <TableGridCell data-width="30%">Event Id</TableGridCell>
            <TableGridCell>Token</TableGridCell>
            {isTabletUp && <TableGridCell>Income (RSN/eRSN)</TableGridCell>}
            {isTabletUp && <TableGridCell>Token Income</TableGridCell>}
            <TableGridCell width="3.65rem" />
          </TableGridHeader>
          <TableGridBody>
            {items.map((item, index) => (
              <TableGridRow key={item.id || index} id={item.id}>
                <TableGridCell>
                  <Identifier loading={isLoading} value={item.eventId} />
                </TableGridCell>
                <TableGridCell>
                  <Token
                    fallback={{ label: item?.lockToken?.name }}
                    loading={isLoading}
                    value={item?.lockToken?.id}
                  />
                </TableGridCell>
                {isTabletUp && (
                  <TableGridCell>
                    <Amount loading={isLoading} value={getRSNIncome(item)} />
                  </TableGridCell>
                )}
                {isTabletUp && (
                  <TableGridCell>
                    {getTokenIncome(item).map((token) => (
                      <Amount
                        key={token.tokenId}
                        decimal={token.decimals}
                        loading={isLoading}
                        value={token.amount}
                        unit={token.name}
                      />
                    ))}
                  </TableGridCell>
                )}
                {!isTabletUp && (
                  <>
                    <TableGridCell>
                      <IconButton
                        disabled={isLoading}
                        size="small"
                        onClick={() => {
                          setCurrent(
                            current?.id === item.id ? undefined : item,
                          );
                        }}
                      >
                        <Icon
                          name={
                            current?.id === item.id ? 'AngleUp' : 'AngleDown'
                          }
                        />
                      </IconButton>
                    </TableGridCell>
                    <TableGridBodyDetails open={current?.id === item.id}>
                      <Label label="Income" orientation="horizontal">
                        <Amount
                          loading={isLoading}
                          value={getRSNIncome(item)}
                        />
                      </Label>
                      <Label label="Token Income" orientation="horizontal">
                        {getTokenIncome(item).map((token) => (
                          <Amount
                            key={token.tokenId}
                            decimal={token.decimals}
                            loading={isLoading}
                            value={token.amount}
                            unit={token.name}
                          />
                        ))}
                      </Label>
                    </TableGridBodyDetails>
                  </>
                )}
              </TableGridRow>
            ))}
          </TableGridBody>
        </TableGrid>
      )}
    </LayoutList>
  );
};

export default Revenues;
