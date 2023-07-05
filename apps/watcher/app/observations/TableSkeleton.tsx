import { useCallback, useMemo, FC } from 'react';

import {
  Skeleton,
  EnhancedTable,
  TableRow,
  TableCell,
} from '@rosen-bridge/ui-kit';

import { mobileHeader, tabletHeader } from './TableRow';

interface TableSkeletonProps {
  numberOfItems: number;
}
const TableSkeleton: FC<TableSkeletonProps> = (props) => {
  const renderMobileRow = useCallback(
    () => (
      <TableRow>
        {mobileHeader.map((headerItem) => (
          <TableCell key={headerItem.title} sx={{ padding: '8px' }}>
            <Skeleton animation="wave" height={60} width="100%" />
          </TableCell>
        ))}
      </TableRow>
    ),
    []
  );

  const renderTabletRow = useCallback(
    () => (
      <TableRow>
        {tabletHeader.map((headerItem) => (
          <TableCell key={headerItem.title} sx={{ padding: '8px' }}>
            <Skeleton animation="wave" height={35} width="100%" />
          </TableCell>
        ))}
      </TableRow>
    ),
    []
  );

  const tableHeaderProps = useMemo(
    () => ({
      mobile: mobileHeader,
      tablet: tabletHeader,
    }),
    []
  );

  const tableRenderRowProps = useMemo(
    () => ({
      mobile: renderMobileRow,
      tablet: renderTabletRow,
    }),
    [renderMobileRow, renderTabletRow]
  );

  return (
    <>
      <EnhancedTable
        data={new Array(props.numberOfItems || 5).fill({})}
        responsiveHead={tableHeaderProps}
        responsiveRenderRow={tableRenderRowProps}
        paginated={false}
      />
    </>
  );
};

export default TableSkeleton;
