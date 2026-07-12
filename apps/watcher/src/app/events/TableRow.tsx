import { type FC, useMemo, useState } from 'react';

import { AngleDown, AngleUp } from '@rosen-bridge/icons';
import {
  Amount,
  Button,
  EnhancedTableCell,
  Identifier,
  TableRow,
} from '@rosen-bridge/ui-kit';
import { getTxURL } from '@rosen-ui/utils';

import type { Event } from '@/types/api';

interface RowProps extends Event {
  isLoading?: boolean;
}

export const mobileHeader = [
  {
    title: ' ',
    cellProps: {
      width: '40%',
    },
  },
  {
    title: '  ',
    cellProps: {
      width: '60%',
    },
  },
];

export const tabletHeader = [
  {
    title: 'Tx Id',
    cellProps: {
      width: 150,
      align: 'center' as const,
    },
  },
  {
    title: 'Token',
    cellProps: {
      width: 150,
      align: 'center' as const,
    },
  },
  {
    title: 'From Address',
    cellProps: {
      width: 150,
      align: 'center' as const,
    },
  },
  {
    title: 'To Address',
    cellProps: {
      width: 150,
      align: 'center' as const,
    },
  },
  {
    title: 'Height',
    cellProps: {
      width: 150,
      align: 'center' as const,
    },
  },
  {
    title: 'Amount',
    cellProps: {
      width: 150,
      align: 'center' as const,
    },
  },
  {
    title: 'Bridge Fee',
    cellProps: {
      width: 150,
      align: 'center' as const,
    },
  },
  {
    title: 'Network Fee',
    cellProps: {
      width: 150,
      align: 'center' as const,
    },
  },
  {
    title: 'Event Id',
    cellProps: {
      width: 150,
      align: 'center' as const,
    },
  },
  {
    title: 'Reports',
    cellProps: {
      width: 150,
      align: 'center' as const,
    },
  },
  {
    title: 'Status',
    cellProps: {
      width: 150,
      align: 'center' as const,
    },
  },
];

export const MobileRow: FC<RowProps> = (props) => {
  const { isLoading, ...row } = props;
  const [expand, setExpand] = useState(false);

  const rowStyles = useMemo(
    () => (isLoading ? { opacity: 0.3 } : {}),
    [isLoading],
  );

  const toggleExpand = () => {
    setExpand((prevState) => !prevState);
  };

  return (
    <>
      <TableRow style={rowStyles}>
        <EnhancedTableCell>Tx Id</EnhancedTableCell>
        <EnhancedTableCell>
          <Identifier
            value={row.sourceTxId}
            href={getTxURL(row.fromChain, row.sourceTxId)}
            variant="legacy"
          />
        </EnhancedTableCell>
      </TableRow>
      <TableRow style={rowStyles}>
        <EnhancedTableCell>Token</EnhancedTableCell>
        <EnhancedTableCell>{row.lockToken.name}</EnhancedTableCell>
      </TableRow>
      {expand && (
        <>
          <TableRow style={rowStyles}>
            <EnhancedTableCell>From Address</EnhancedTableCell>
            <EnhancedTableCell>
              <Identifier value={row.fromAddress} variant="legacy" />
            </EnhancedTableCell>
          </TableRow>
          <TableRow style={rowStyles}>
            <EnhancedTableCell>To Address</EnhancedTableCell>
            <EnhancedTableCell>
              <Identifier value={row.toAddress} variant="legacy" />
            </EnhancedTableCell>
          </TableRow>
          <TableRow style={rowStyles}>
            <EnhancedTableCell>Height</EnhancedTableCell>
            <EnhancedTableCell>{row.height}</EnhancedTableCell>
          </TableRow>
          <TableRow style={rowStyles}>
            <EnhancedTableCell>Amount</EnhancedTableCell>
            <EnhancedTableCell>
              <Amount value={row.amount} decimal={row.lockToken.decimals} />
            </EnhancedTableCell>
          </TableRow>
          <TableRow style={rowStyles}>
            <EnhancedTableCell>Bridge Fee</EnhancedTableCell>
            <EnhancedTableCell>
              <Amount value={row.bridgeFee} decimal={row.lockToken.decimals} />
            </EnhancedTableCell>
          </TableRow>
          <TableRow style={rowStyles}>
            <EnhancedTableCell>Network Fee</EnhancedTableCell>
            <EnhancedTableCell>
              <Amount value={row.networkFee} decimal={row.lockToken.decimals} />
            </EnhancedTableCell>
          </TableRow>
          <TableRow style={rowStyles}>
            <EnhancedTableCell>Event Id</EnhancedTableCell>
            <EnhancedTableCell>
              <Identifier value={row.eventId} variant="legacy" />
            </EnhancedTableCell>
          </TableRow>
          <TableRow style={rowStyles}>
            <EnhancedTableCell>Reports</EnhancedTableCell>
            <EnhancedTableCell>{row.WIDsCount}</EnhancedTableCell>
          </TableRow>
          <TableRow style={rowStyles}>
            <EnhancedTableCell>Status</EnhancedTableCell>
            <EnhancedTableCell>
              {row.spendBlock ? 'Completed' : 'Incomplete'}
            </EnhancedTableCell>
          </TableRow>
        </>
      )}
      <TableRow style={rowStyles}>
        <EnhancedTableCell padding="none">
          <Button
            variant="text"
            onClick={toggleExpand}
            style={{ fontSize: 'inherit' }}
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

  const rowStyles = useMemo(
    () => (isLoading ? { opacity: 0.3 } : {}),
    [isLoading],
  );

  return (
    <TableRow className="divider" style={rowStyles}>
      <EnhancedTableCell align="center">
        <Identifier
          value={row.sourceTxId}
          href={getTxURL(row.fromChain, row.sourceTxId)}
          variant="legacy"
          style={{ justifyContent: 'center' }}
        />
      </EnhancedTableCell>
      <EnhancedTableCell align="center">{row.lockToken.name}</EnhancedTableCell>
      <EnhancedTableCell align="center">
        <Identifier value={row.fromAddress} variant="legacy" />
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        <Identifier value={row.toAddress} variant="legacy" />
      </EnhancedTableCell>
      <EnhancedTableCell align="center">{row.height}</EnhancedTableCell>
      <EnhancedTableCell align="center">
        <Amount value={row.amount} decimal={row.lockToken.decimals} />
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        <Amount value={row.bridgeFee} decimal={row.lockToken.decimals} />
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        <Amount value={row.networkFee} decimal={row.lockToken.decimals} />
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        <Identifier value={row.eventId} variant="legacy" />
      </EnhancedTableCell>
      <EnhancedTableCell align="center">{row.WIDsCount}</EnhancedTableCell>
      <EnhancedTableCell align="center">
        {row.spendBlock ? 'Completed' : 'Incomplete'}
      </EnhancedTableCell>
    </TableRow>
  );
};
