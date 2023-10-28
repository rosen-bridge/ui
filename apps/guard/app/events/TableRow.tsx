import { useState, FC, useMemo } from 'react';

import {
  Button,
  EnhancedTableCell,
  TableRow,
  Link,
} from '@rosen-bridge/ui-kit';

import { AngleDown, AngleUp } from '@rosen-bridge/icons';

import { getDecimalString } from '@rosen-ui/utils';

import { CARDANO_BASE_TX_URL, ERGO_BASE_TX_URL } from '@/_constants';

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
    title: 'Token Id',
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
];

const renderValue = (value?: string | number | undefined) => {
  return value || '-';
};

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

  const baseTxUrl =
    row.fromChain === 'ergo' ? ERGO_BASE_TX_URL : CARDANO_BASE_TX_URL;

  return (
    <>
      <TableRow sx={isLoading ? { opacity: 0.3 } : {}}>
        <EnhancedTableCell>Tx Id</EnhancedTableCell>
        <EnhancedTableCell>
          <Link href={`${baseTxUrl}${row.sourceTxId}`} target="_blank">
            {row.sourceTxId.slice(0, 8)}
          </Link>
        </EnhancedTableCell>
      </TableRow>
      <TableRow sx={isLoading ? { opacity: 0.3 } : {}}>
        <EnhancedTableCell>Token Id</EnhancedTableCell>
        <EnhancedTableCell>
          {row.sourceChainToken.tokenId.slice(0, 8)}
        </EnhancedTableCell>
      </TableRow>
      {expand && (
        <>
          <TableRow sx={isLoading ? { opacity: 0.3 } : {}}>
            <EnhancedTableCell>From Address</EnhancedTableCell>
            <EnhancedTableCell>{row.fromAddress.slice(0, 8)}</EnhancedTableCell>
          </TableRow>
          <TableRow sx={isLoading ? { opacity: 0.3 } : {}}>
            <EnhancedTableCell>To Address</EnhancedTableCell>
            <EnhancedTableCell>{row.toAddress.slice(0, 8)}</EnhancedTableCell>
          </TableRow>
          <TableRow sx={isLoading ? { opacity: 0.3 } : {}}>
            <EnhancedTableCell>Amount</EnhancedTableCell>
            <EnhancedTableCell>
              {getDecimalString(
                row.sourceChainToken.amount.toString(),
                row.sourceChainToken.decimals,
              )}
            </EnhancedTableCell>
          </TableRow>
          <TableRow sx={rowStyles}>
            <EnhancedTableCell>Bridge Fee</EnhancedTableCell>
            <EnhancedTableCell>
              {getDecimalString(row.bridgeFee, row.sourceChainToken.decimals)}
            </EnhancedTableCell>
          </TableRow>
          <TableRow sx={rowStyles}>
            <EnhancedTableCell>Network Fee</EnhancedTableCell>
            <EnhancedTableCell>
              {getDecimalString(row.networkFee, row.sourceChainToken.decimals)}
            </EnhancedTableCell>
          </TableRow>
          <TableRow sx={rowStyles}>
            <EnhancedTableCell>Event Id</EnhancedTableCell>
            <EnhancedTableCell>{row.eventId.slice(0, 8)}</EnhancedTableCell>
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

  const baseTxUrl =
    row.fromChain === 'ergo' ? ERGO_BASE_TX_URL : CARDANO_BASE_TX_URL;

  return (
    <TableRow className="divider" sx={isLoading ? { opacity: 0.3 } : {}}>
      <EnhancedTableCell>
        <Link
          href={`${baseTxUrl}${row.sourceTxId}`}
          target="_blank"
          color="textPrimary"
          underline="hover"
        >
          {row.sourceTxId.slice(0, 8)}
        </Link>
      </EnhancedTableCell>
      <EnhancedTableCell>
        {row.sourceChainToken.tokenId.slice(0, 8)}
      </EnhancedTableCell>
      <EnhancedTableCell>{row.fromAddress.slice(0, 8)}</EnhancedTableCell>
      <EnhancedTableCell>{row.toAddress.slice(0, 8)}</EnhancedTableCell>
      <EnhancedTableCell>
        {getDecimalString(
          row.sourceChainToken.amount.toString(),
          row.sourceChainToken.decimals,
        )}
      </EnhancedTableCell>
      <EnhancedTableCell>
        {getDecimalString(row.bridgeFee, row.sourceChainToken.decimals)}
      </EnhancedTableCell>
      <EnhancedTableCell>
        {getDecimalString(row.networkFee, row.sourceChainToken.decimals)}
      </EnhancedTableCell>
      <EnhancedTableCell>{row.eventId.slice(0, 8)}</EnhancedTableCell>
    </TableRow>
  );
};
