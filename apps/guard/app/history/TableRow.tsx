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

import { HistoryEvent } from '@/_types/api';

interface RowProps extends HistoryEvent {
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
    title: 'Event Id',
    cellProps: {
      width: 150,
    },
  },
  {
    title: 'Lock TX Id',
    cellProps: {
      width: 150,
    },
  },
  {
    title: 'Reward TX Id',
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
    title: 'Token Id',
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

  const baseTxUrl =
    row.fromChain === 'ergo' ? ERGO_BASE_TX_URL : CARDANO_BASE_TX_URL;

  return (
    <>
      <TableRow sx={isLoading ? { opacity: 0.3 } : {}}>
        <EnhancedTableCell>Event Id</EnhancedTableCell>
        <EnhancedTableCell>{row.eventId.slice(0, 10)}</EnhancedTableCell>
      </TableRow>
      <TableRow sx={isLoading ? { opacity: 0.3 } : {}}>
        <EnhancedTableCell>Lock TX Id</EnhancedTableCell>
        <EnhancedTableCell>
          <Link href={`${baseTxUrl}${row.sourceTxId}`} target="_blank">
            {row.sourceTxId.slice(0, 10)}
          </Link>
        </EnhancedTableCell>
      </TableRow>
      {expand && (
        <>
          <TableRow sx={isLoading ? { opacity: 0.3 } : {}}>
            <EnhancedTableCell>Reward TX Id</EnhancedTableCell>
            <EnhancedTableCell>
              <Link
                href={`${ERGO_BASE_TX_URL}${row.rewardTxId}`}
                target="_blank"
              >
                {row.rewardTxId.slice(0, 10)}
              </Link>
            </EnhancedTableCell>
          </TableRow>
          <TableRow sx={isLoading ? { opacity: 0.3 } : {}}>
            <EnhancedTableCell>From Address</EnhancedTableCell>
            <EnhancedTableCell>
              {row.fromAddress.slice(0, 10)}
            </EnhancedTableCell>
          </TableRow>
          <TableRow sx={isLoading ? { opacity: 0.3 } : {}}>
            <EnhancedTableCell>To Address</EnhancedTableCell>
            <EnhancedTableCell>{row.toAddress.slice(0, 10)}</EnhancedTableCell>
          </TableRow>
          <TableRow sx={isLoading ? { opacity: 0.3 } : {}}>
            <EnhancedTableCell>Token Id</EnhancedTableCell>
            <EnhancedTableCell>
              {row.sourceChainToken.tokenId.slice(0, 10)}
            </EnhancedTableCell>
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
            <EnhancedTableCell>Status</EnhancedTableCell>
            <EnhancedTableCell>{row.status}</EnhancedTableCell>
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
      <EnhancedTableCell>{row.eventId.slice(0, 10)}</EnhancedTableCell>
      <EnhancedTableCell>
        <Link
          href={`${baseTxUrl}${row.sourceTxId}`}
          target="_blank"
          color="textPrimary"
          underline="hover"
        >
          {row.sourceTxId.slice(0, 10)}
        </Link>
      </EnhancedTableCell>
      <EnhancedTableCell>
        <Link
          href={`${ERGO_BASE_TX_URL}${row.rewardTxId}`}
          target="_blank"
          color="textPrimary"
          underline="hover"
        >
          {row.rewardTxId.slice(0, 10)}
        </Link>
      </EnhancedTableCell>
      <EnhancedTableCell>{row.fromAddress.slice(0, 10)}</EnhancedTableCell>
      <EnhancedTableCell>{row.toAddress.slice(0, 10)}</EnhancedTableCell>
      <EnhancedTableCell>
        {row.sourceChainToken.tokenId.slice(0, 10)}
      </EnhancedTableCell>
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
      <EnhancedTableCell>{row.status}</EnhancedTableCell>
    </TableRow>
  );
};
