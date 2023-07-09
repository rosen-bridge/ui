import { useState, FC, useMemo } from 'react';

import {
  Button,
  EnhancedTableCell,
  TableRow,
  TableCell,
  TableCellProps,
} from '@rosen-bridge/ui-kit';

import { AngleDown, AngleUp } from '@rosen-bridge/icons';

import { Observation } from '@/_types/api';

interface RowProps extends Observation {
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
      width: 50,
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
  {
    title: 'Height',
    cellProps: {
      width: 150,
    },
  },
  {
    title: 'Network',
    cellProps: {
      width: 150,
    },
  },
  {
    title: 'Bridge',
    cellProps: {
      width: 150,
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
        <EnhancedTableCell>{row.id}</EnhancedTableCell>
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
          <TableRow sx={rowStyles}>
            <EnhancedTableCell>Height</EnhancedTableCell>
            <EnhancedTableCell>{renderValue(row.height)}</EnhancedTableCell>
          </TableRow>
          <TableRow sx={rowStyles}>
            <EnhancedTableCell>Network fee</EnhancedTableCell>
            <EnhancedTableCell>{renderValue(row.networkFee)}</EnhancedTableCell>
          </TableRow>
          <TableRow sx={rowStyles}>
            <EnhancedTableCell>Bridge fee</EnhancedTableCell>
            <EnhancedTableCell>{renderValue(row.bridgeFee)}</EnhancedTableCell>
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
      <EnhancedTableCell>{row.id}</EnhancedTableCell>
      <EnhancedTableCell>{row.fromChain}</EnhancedTableCell>
      <EnhancedTableCell>{row.toChain}</EnhancedTableCell>
      <EnhancedTableCell align="right">{row.amount}</EnhancedTableCell>
      <EnhancedTableCell>{renderValue(row.height)}</EnhancedTableCell>
      <EnhancedTableCell>{renderValue(row.networkFee)}</EnhancedTableCell>
      <EnhancedTableCell>{renderValue(row.bridgeFee)}</EnhancedTableCell>
    </TableRow>
  );
};
