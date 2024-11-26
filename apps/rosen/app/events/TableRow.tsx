import { useState, FC, useMemo } from 'react';

import { AngleDown, AngleUp } from '@rosen-bridge/icons';
import {
  Button,
  EnhancedTableCell,
  TableRow,
  Link,
  Typography,
  Id,
} from '@rosen-bridge/ui-kit';
import { Network } from '@rosen-ui/types';
import { getDecimalString, getTxURL } from '@rosen-ui/utils';
import { upperFirst } from 'lodash-es';
import moment from 'moment';

import { Event } from '@/_types';

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

  const txUrl = getTxURL(row.fromChain, row.sourceTxId);

  return (
    <>
      <TableRow sx={isLoading ? { opacity: 0.3 } : {}}>
        <EnhancedTableCell>Event Id</EnhancedTableCell>
        <EnhancedTableCell>
          <Id id={row.eventId} />
        </EnhancedTableCell>
      </TableRow>
      <TableRow sx={isLoading ? { opacity: 0.3 } : {}}>
        <EnhancedTableCell>Lock TX Id</EnhancedTableCell>
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
      {expand && (
        <>
          <TableRow sx={isLoading ? { opacity: 0.3 } : {}}>
            <EnhancedTableCell>Chain</EnhancedTableCell>
            <EnhancedTableCell>
              {upperFirst(row.fromChain as Network)}
              <Typography variant="h5" display="inline" mx={1}>
                →
              </Typography>
              {upperFirst(row.toChain as Network)}
            </EnhancedTableCell>
          </TableRow>
          <TableRow sx={isLoading ? { opacity: 0.3 } : {}}>
            <EnhancedTableCell>Height</EnhancedTableCell>
            <EnhancedTableCell>{row.height}</EnhancedTableCell>
          </TableRow>
          <TableRow sx={isLoading ? { opacity: 0.3 } : {}}>
            <EnhancedTableCell>Addresses</EnhancedTableCell>
            <EnhancedTableCell>
              <Id id={row.fromAddress} />
              <Typography variant="h5" display="inline" mx={1}>
                →
              </Typography>
              <Id id={row.toAddress} />
            </EnhancedTableCell>
          </TableRow>
          <TableRow sx={isLoading ? { opacity: 0.3 } : {}}>
            <EnhancedTableCell>Token</EnhancedTableCell>
            <EnhancedTableCell>{row.lockToken.name}</EnhancedTableCell>
          </TableRow>
          <TableRow sx={isLoading ? { opacity: 0.3 } : {}}>
            <EnhancedTableCell>Amount</EnhancedTableCell>
            <EnhancedTableCell>
              {getDecimalString(
                row.amount.toString(),
                row.lockToken.significantDecimals,
              )}
            </EnhancedTableCell>
          </TableRow>
          <TableRow sx={rowStyles}>
            <EnhancedTableCell>Bridge Fee</EnhancedTableCell>
            <EnhancedTableCell>
              {getDecimalString(
                row.bridgeFee.toString(),
                row.lockToken.significantDecimals,
              )}
            </EnhancedTableCell>
          </TableRow>
          <TableRow sx={rowStyles}>
            <EnhancedTableCell>Network Fee</EnhancedTableCell>
            <EnhancedTableCell>
              {getDecimalString(
                row.networkFee.toString(),
                row.lockToken.significantDecimals,
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

  const txUrl = getTxURL(row.fromChain, row.sourceTxId);

  return (
    <TableRow className="divider" sx={isLoading ? { opacity: 0.3 } : {}}>
      <EnhancedTableCell align="center">
        <Id id={row.eventId} />
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
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
      <EnhancedTableCell align="center">
        {upperFirst(row.fromChain as Network)}
        <Typography variant="h5" display="inline" mx={1}>
          →
        </Typography>
        {upperFirst(row.toChain as Network)}
      </EnhancedTableCell>
      <EnhancedTableCell align="center">{row.height}</EnhancedTableCell>
      <EnhancedTableCell align="center">
        <Id id={row.fromAddress} />
        <Typography variant="h5" display="inline" mx={1}>
          →
        </Typography>
        <Id id={row.toAddress} />
      </EnhancedTableCell>
      <EnhancedTableCell align="center">{row.lockToken.name}</EnhancedTableCell>
      <EnhancedTableCell align="center">
        {getDecimalString(
          row.amount.toString(),
          row.lockToken.significantDecimals,
        )}
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        {getDecimalString(
          row.bridgeFee.toString(),
          row.lockToken.significantDecimals,
        )}
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        {getDecimalString(
          row.networkFee.toString(),
          row.lockToken.significantDecimals,
        )}
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
