import { upperFirst } from 'lodash-es';
import moment from 'moment';
import { useState, FC, useMemo } from 'react';

import {
  Button,
  EnhancedTableCell,
  TableRow,
  Link,
  Typography,
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
    title: 'Event Id',
    cellProps: {
      width: 150,
      align: 'center' as const,
    },
  },
  {
    title: 'Lock TX Id',
    cellProps: {
      width: 150,
      align: 'center' as const,
    },
  },
  {
    title: 'Chain',
    cellProps: {
      width: 250,
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
    title: 'Addresses',
    cellProps: {
      width: 300,
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
    title: 'Time',
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

const statusMap = {
  fraud: 'fraud',
  processing: 'processing',
  successful: 'done',
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
            <EnhancedTableCell>Chain</EnhancedTableCell>
            <EnhancedTableCell>
              {upperFirst(row.fromChain)}
              <Typography variant="h5" display="inline" mx={1}>
                →
              </Typography>
              {upperFirst(row.toChain)}
            </EnhancedTableCell>
          </TableRow>
          <TableRow sx={isLoading ? { opacity: 0.3 } : {}}>
            <EnhancedTableCell>Height</EnhancedTableCell>
            <EnhancedTableCell>{row.height}</EnhancedTableCell>
          </TableRow>
          <TableRow sx={isLoading ? { opacity: 0.3 } : {}}>
            <EnhancedTableCell>Addresses</EnhancedTableCell>
            <EnhancedTableCell>
              {row.fromAddress.slice(0, 10)}
              <Typography variant="h5" display="inline" mx={1}>
                →
              </Typography>
              {row.toAddress.slice(0, 10)}
            </EnhancedTableCell>
          </TableRow>
          <TableRow sx={isLoading ? { opacity: 0.3 } : {}}>
            <EnhancedTableCell>Token</EnhancedTableCell>
            <EnhancedTableCell>{row.lockToken.name}</EnhancedTableCell>
          </TableRow>
          <TableRow sx={isLoading ? { opacity: 0.3 } : {}}>
            <EnhancedTableCell>Amount</EnhancedTableCell>
            <EnhancedTableCell>
              {getDecimalString(row.amount.toString(), row.lockToken.decimals)}
            </EnhancedTableCell>
          </TableRow>
          <TableRow sx={rowStyles}>
            <EnhancedTableCell>Bridge Fee</EnhancedTableCell>
            <EnhancedTableCell>
              {getDecimalString(
                row.bridgeFee.toString(),
                row.lockToken.decimals,
              )}
            </EnhancedTableCell>
          </TableRow>
          <TableRow sx={rowStyles}>
            <EnhancedTableCell>Network Fee</EnhancedTableCell>
            <EnhancedTableCell>
              {getDecimalString(
                row.networkFee.toString(),
                row.lockToken.decimals,
              )}
            </EnhancedTableCell>
          </TableRow>
          <TableRow sx={rowStyles}>
            <EnhancedTableCell>Time</EnhancedTableCell>
            <EnhancedTableCell>
              {moment(row.timestamp * 1000).fromNow()}
            </EnhancedTableCell>
          </TableRow>
          <TableRow sx={rowStyles}>
            <EnhancedTableCell>Status</EnhancedTableCell>
            <EnhancedTableCell>
              {statusMap[row.status] ?? 'unknown'}
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

  const baseTxUrl =
    row.fromChain === 'ergo' ? ERGO_BASE_TX_URL : CARDANO_BASE_TX_URL;

  return (
    <TableRow className="divider" sx={isLoading ? { opacity: 0.3 } : {}}>
      <EnhancedTableCell align="center">
        {row.eventId.slice(0, 10)}
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        <Link
          href={`${baseTxUrl}${row.sourceTxId}`}
          target="_blank"
          color="textPrimary"
          underline="hover"
        >
          {row.sourceTxId.slice(0, 10)}
        </Link>
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        {upperFirst(row.fromChain)}
        <Typography variant="h5" display="inline" mx={1}>
          →
        </Typography>
        {upperFirst(row.toChain)}
      </EnhancedTableCell>
      <EnhancedTableCell align="center">{row.height}</EnhancedTableCell>
      <EnhancedTableCell align="center">
        {row.fromAddress.slice(0, 10)}
        <Typography variant="h5" display="inline" mx={1}>
          →
        </Typography>
        {row.toAddress.slice(0, 10)}
      </EnhancedTableCell>
      <EnhancedTableCell align="center">{row.lockToken.name}</EnhancedTableCell>
      <EnhancedTableCell align="center">
        {getDecimalString(row.amount.toString(), row.lockToken.decimals)}
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        {getDecimalString(row.bridgeFee.toString(), row.lockToken.decimals)}
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        {getDecimalString(row.networkFee.toString(), row.lockToken.decimals)}
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        {moment(row.timestamp * 1000).fromNow()}
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        {statusMap[row.status] ?? 'unknown'}
      </EnhancedTableCell>
    </TableRow>
  );
};
