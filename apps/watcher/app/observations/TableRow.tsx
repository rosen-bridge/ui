import { useState, FC } from 'react';

import { TableRow, TableCell, Button } from '@rosen-bridge/ui-kit';

import { AngleDown, AngleUp } from '@rosen-bridge/icons';

import { Observation } from '@/_types/api';

type RowProps = Observation;

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

export const MobileRow: FC<RowProps> = (row) => {
  const [expand, set_expand] = useState(false);

  const toggle_expand = () => {
    set_expand((prevState) => !prevState);
  };

  return (
    <>
      <TableRow className="divider">
        <TableCell>Id</TableCell>
        <TableCell>{row.id}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>From chain</TableCell>
        <TableCell>{row.fromChain}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>To chain</TableCell>
        <TableCell>{row.toChain}</TableCell>
      </TableRow>
      {expand && (
        <>
          <TableRow>
            <TableCell>Amount</TableCell>
            <TableCell>{row.amount}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Height</TableCell>
            <TableCell>{renderValue(row.height)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Network fee</TableCell>
            <TableCell>{renderValue(row.networkFee)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Bridge fee</TableCell>
            <TableCell>{renderValue(row.bridgeFee)}</TableCell>
          </TableRow>
        </>
      )}
      <TableRow>
        <TableCell padding="none">
          <Button
            variant="text"
            onClick={toggle_expand}
            sx={{ fontSize: 'inherit' }}
            endIcon={expand ? <AngleUp /> : <AngleDown />}
          >
            {expand ? 'Show less' : 'Show more'}
          </Button>
        </TableCell>
        <TableCell />
      </TableRow>
    </>
  );
};

export const TabletRow: FC<RowProps> = (row) => (
  <>
    <TableRow className="divider">
      <TableCell>{row.id}</TableCell>
      <TableCell>{row.fromChain}</TableCell>
      <TableCell>{row.toChain}</TableCell>
      <TableCell align="right">{row.amount}</TableCell>
      <TableCell>{renderValue(row.height)}</TableCell>
      <TableCell>{renderValue(row.networkFee)}</TableCell>
      <TableCell>{renderValue(row.bridgeFee)}</TableCell>
    </TableRow>
  </>
);
