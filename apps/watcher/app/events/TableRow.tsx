import { useState, FC, useMemo } from 'react';

import { Button, EnhancedTableCell, TableRow } from '@rosen-bridge/ui-kit';

import { AngleDown, AngleUp } from '@rosen-bridge/icons';

import { Event } from '@rosen-ui/types';

interface RowProps extends Event {
  isLoading?: boolean;
}

export const mobileHeader = [
  {
    title: '',
    cellProps: {
      width: '40%',
    },
  },
  {
    title: '',
    cellProps: {
      width: '60%',
    },
  },
];

export const tabletHeader = [
  {
    title: 'ID',
    cellProps: {
      width: 150,
    },
  },
  {
    title: 'From',
    cellProps: {
      width: 250,
    },
  },
  {
    title: 'To',
    cellProps: {
      width: 150,
    },
  },
  {
    title: 'Amount',
    cellProps: {
      width: 150,
      align: 'right' as const,
    },
  },
];

const renderValue = (value?: string | number | undefined) => {
  return value || '-';
};

export const MobileRow: FC<RowProps> = (props) => {
  const { isLoading, ...row } = props;
  const [expand, setExpand] = useState(false);

  const rowStyles = useMemo(
    () => (isLoading ? { opacity: 0.3 } : {}),
    [isLoading]
  );

  const toggleExpand = () => {
    setExpand((prevState) => !prevState);
  };

  return (
    <>
      <TableRow className="divider" sx={rowStyles}>
        <EnhancedTableCell>Id</EnhancedTableCell>
        <EnhancedTableCell>{row.eventId}</EnhancedTableCell>
      </TableRow>
      <TableRow sx={rowStyles}>
        <EnhancedTableCell tooltipTitle={row.fromChain}>
          From chain
        </EnhancedTableCell>
        <EnhancedTableCell>{row.fromChain}</EnhancedTableCell>
      </TableRow>
      <TableRow sx={rowStyles}>
        <EnhancedTableCell>To chain</EnhancedTableCell>
        <EnhancedTableCell>{row.toChain}</EnhancedTableCell>
      </TableRow>
      {expand && (
        <>
          <TableRow sx={isLoading ? { opacity: 0.3 } : {}}>
            <EnhancedTableCell>Amount</EnhancedTableCell>
            <EnhancedTableCell>{row.amount}</EnhancedTableCell>
          </TableRow>
        </>
      )}
      <TableRow sx={isLoading ? { opacity: 0.3 } : {}}>
        <EnhancedTableCell padding="none">
          <Button
            variant="text"
            onClick={toggleExpand}
            sx={{ fontSize: 'inherit' }}
            endIcon={expand ? <AngleUp /> : <AngleDown />}
          >
            {expand ? 'Show less' : 'Show more'}
          </Button>
        </EnhancedTableCell>
        <EnhancedTableCell />
      </TableRow>
    </>
  );
};

export const TabletRow: FC<RowProps> = (props) => {
  const { isLoading, ...row } = props;
  return (
    <TableRow className="divider" sx={isLoading ? { opacity: 0.3 } : {}}>
      <EnhancedTableCell>{row.eventId}</EnhancedTableCell>
      <EnhancedTableCell>{row.fromChain}</EnhancedTableCell>
      <EnhancedTableCell>{row.toChain}</EnhancedTableCell>
      <EnhancedTableCell align="right">{row.amount}</EnhancedTableCell>
    </TableRow>
  );
};
