import { useState, FC, useMemo } from 'react';

import {
  Button,
  EnhancedTableCell,
  Id,
  Link,
  TableRow,
} from '@rosen-bridge/ui-kit';
import { getDecimalString, getTxURL } from '@rosen-ui/utils';

import { AngleDown, AngleUp } from '@rosen-bridge/icons';

import { Event } from '@/_types/api';

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
    title: 'Tx Id',
    cellProps: {
      width: 150,
    },
  },
  {
    title: 'Token',
    cellProps: {
      width: 150,
    },
  },
  {
    title: 'From Address',
    cellProps: {
      width: 150,
    },
  },
  {
    title: 'To Address',
    cellProps: {
      width: 150,
    },
  },
  {
    title: 'Height',
    cellProps: {
      width: 150,
    },
  },
  {
    title: 'Amount',
    cellProps: {
      width: 150,
    },
  },
  {
    title: 'Bridge Fee',
    cellProps: {
      width: 150,
    },
  },
  {
    title: 'Network Fee',
    cellProps: {
      width: 150,
    },
  },
  {
    title: 'Event Id',
    cellProps: {
      width: 150,
    },
  },
  {
    title: 'Reports',
    cellProps: {
      width: 150,
    },
  },
  {
    title: 'Status',
    cellProps: {
      width: 150,
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

  const txUrl = getTxURL(row.fromChain, row.sourceTxId);

  return (
    <>
      <TableRow sx={isLoading ? { opacity: 0.3 } : {}}>
        <EnhancedTableCell>Tx Id</EnhancedTableCell>
        <EnhancedTableCell>
          {txUrl ? (
            <Link href={txUrl} target="_blank">
              <Id id={row.sourceTxId} />
            </Link>
          ) : (
            <Id id={row.sourceTxId} />
          )}
        </EnhancedTableCell>
      </TableRow>
      <TableRow sx={isLoading ? { opacity: 0.3 } : {}}>
        <EnhancedTableCell>Token</EnhancedTableCell>
        <EnhancedTableCell>{row.lockToken.name}</EnhancedTableCell>
      </TableRow>
      {expand && (
        <>
          <TableRow sx={isLoading ? { opacity: 0.3 } : {}}>
            <EnhancedTableCell>From Address</EnhancedTableCell>
            <EnhancedTableCell>
              <Id id={row.fromAddress} />
            </EnhancedTableCell>
          </TableRow>
          <TableRow sx={isLoading ? { opacity: 0.3 } : {}}>
            <EnhancedTableCell>To Address</EnhancedTableCell>
            <EnhancedTableCell>
              <Id id={row.toAddress} />
            </EnhancedTableCell>
          </TableRow>
          <TableRow sx={rowStyles}>
            <EnhancedTableCell>Height</EnhancedTableCell>
            <EnhancedTableCell>{row.height}</EnhancedTableCell>
          </TableRow>
          <TableRow sx={isLoading ? { opacity: 0.3 } : {}}>
            <EnhancedTableCell>Amount</EnhancedTableCell>
            <EnhancedTableCell>
              {getDecimalString(row.amount, row.lockToken.decimals)}
            </EnhancedTableCell>
          </TableRow>
          <TableRow sx={rowStyles}>
            <EnhancedTableCell>Bridge Fee</EnhancedTableCell>
            <EnhancedTableCell>
              {getDecimalString(row.bridgeFee, row.lockToken.decimals)}
            </EnhancedTableCell>
          </TableRow>
          <TableRow sx={rowStyles}>
            <EnhancedTableCell>Network Fee</EnhancedTableCell>
            <EnhancedTableCell>
              {getDecimalString(row.networkFee, row.lockToken.decimals)}
            </EnhancedTableCell>
          </TableRow>
          <TableRow sx={rowStyles}>
            <EnhancedTableCell>Event Id</EnhancedTableCell>
            <EnhancedTableCell>
              <Id id={row.eventId} />
            </EnhancedTableCell>
          </TableRow>
          <TableRow sx={rowStyles}>
            <EnhancedTableCell>Reports</EnhancedTableCell>
            <EnhancedTableCell>{row.WIDsCount}</EnhancedTableCell>
          </TableRow>
          <TableRow sx={rowStyles}>
            <EnhancedTableCell>Status</EnhancedTableCell>
            <EnhancedTableCell>
              {row.spendBlock ? 'Completed' : 'Incomplete'}
            </EnhancedTableCell>
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

  const txUrl = getTxURL(row.fromChain, row.sourceTxId);

  return (
    <TableRow className="divider" sx={isLoading ? { opacity: 0.3 } : {}}>
      <EnhancedTableCell>
        {txUrl ? (
          <Link
            href={txUrl}
            target="_blank"
            color="textPrimary"
            underline="hover"
          >
            <Id id={row.sourceTxId} />
          </Link>
        ) : (
          <Id id={row.sourceTxId} />
        )}
      </EnhancedTableCell>
      <EnhancedTableCell>{row.lockToken.name}</EnhancedTableCell>
      <EnhancedTableCell>
        <Id id={row.fromAddress} />
      </EnhancedTableCell>
      <EnhancedTableCell>
        <Id id={row.toAddress} />
      </EnhancedTableCell>
      <EnhancedTableCell>{row.height}</EnhancedTableCell>
      <EnhancedTableCell>
        {getDecimalString(row.amount, row.lockToken.decimals)}
      </EnhancedTableCell>
      <EnhancedTableCell>
        {getDecimalString(row.bridgeFee, row.lockToken.decimals)}
      </EnhancedTableCell>
      <EnhancedTableCell>
        {getDecimalString(row.networkFee, row.lockToken.decimals)}
      </EnhancedTableCell>
      <EnhancedTableCell>
        <Id id={row.eventId} />
      </EnhancedTableCell>
      <EnhancedTableCell>{row.WIDsCount}</EnhancedTableCell>
      <EnhancedTableCell>
        {row.spendBlock ? 'Completed' : 'Incomplete'}
      </EnhancedTableCell>
    </TableRow>
  );
};
