'use client';

import { useCallback, useMemo } from 'react';

import { EnhancedTable, Grid } from '@rosen-bridge/ui-kit';
import { Network } from '@rosen-ui/types';

import { useBalance } from '@/_hooks/useBalance';
import { GuardTokenInfo } from '@/_types/api';

import { MobileRow, TabletRow, mobileHeader, tabletHeader } from './TableRow';
import { TableSkeleton } from './TableSkeleton';

const Assets = () => {
  const { data, isLoading } = useBalance();

  const items = useMemo(() => {
    if (!data) return [];

    const items = [
      ...data.cold.items.map((item) => ({ ...item, type: 'cold' })),
      ...data.hot.items.map((item) => ({ ...item, type: 'hot' })),
    ];

    const all = Object.groupBy(
      items,
      (item) => item.chain + ':' + item.balance.tokenId,
    );

    return Object.values(all)
      .filter((items) => !!items)
      .map((items) => {
        const cold = items.find((item) => item.type === 'cold');

        const hot = items.find((item) => item.type === 'hot');

        const token = Object.assign({}, hot?.balance, cold?.balance, {
          chain: (cold?.chain || hot?.chain) as Network,
          amount: hot?.balance.amount || 0,
          coldAmount: cold?.balance.amount || 0,
        });

        return token;
      });
  }, [data]);

  const renderMobileRow = useCallback(
    (rowData: GuardTokenInfo) => (
      <MobileRow {...rowData} isLoading={isLoading} />
    ),
    [isLoading],
  );

  const renderTabletRow = useCallback(
    (rowData: GuardTokenInfo) => (
      <TabletRow {...rowData} isLoading={isLoading} />
    ),
    [isLoading],
  );

  const tableHeaderProps = useMemo(
    () => ({
      mobile: mobileHeader,
      tablet: tabletHeader,
    }),
    [],
  );

  const tableRenderRowProps = useMemo(
    () => ({
      mobile: renderMobileRow,
      tablet: renderTabletRow,
    }),
    [renderMobileRow, renderTabletRow],
  );

  return isLoading ? (
    <Grid>
      <TableSkeleton numberOfItems={25} />
    </Grid>
  ) : (
    data && (
      <Grid container>
        <EnhancedTable
          data={items}
          responsiveHead={tableHeaderProps}
          responsiveRenderRow={tableRenderRowProps}
          paginated={false}
        />
      </Grid>
    )
  );
};

export default Assets;
