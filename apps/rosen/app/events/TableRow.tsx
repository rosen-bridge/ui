import { useState, FC, useMemo } from 'react';

import { AngleDown, AngleUp } from '@rosen-bridge/icons';
import {
  Amount,
  Button,
  EnhancedTableCell,
  TableRow,
  Id,
  Connector,
} from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';
import { getDecimalString, getTxURL } from '@rosen-ui/utils';
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
      width: '8%',
      align: 'center' as const,
    },
  },
  {
    title: 'Lock TX Id',
    cellProps: {
      width: '10%',
      align: 'center' as const,
    },
  },
  {
    title: 'Chain',
    cellProps: {
      width: '10%',
      align: 'center' as const,
    },
  },
  {
    title: 'Height',
    cellProps: {
      width: '6%',
      align: 'center' as const,
    },
  },
  {
    title: 'Addresses',
    cellProps: {
      width: '16%',
      align: 'center' as const,
    },
  },
  {
    title: 'Token',
    cellProps: {
      width: '7%',
      align: 'center' as const,
    },
  },
  {
    title: 'Amount',
    cellProps: {
      width: '8%',
      align: 'center' as const,
    },
  },
  {
    title: 'Bridge Fee',
    cellProps: {
      width: '8%',
      align: 'center' as const,
      style: { whiteSpace: 'nowrap' as const },
    },
  },
  {
    title: 'Network Fee',
    cellProps: {
      width: '9%',
      align: 'center' as const,
      style: { whiteSpace: 'nowrap' as const },
    },
  },
  {
    title: 'Time',
    cellProps: {
      width: '10%',
      align: 'center' as const,
    },
  },
  {
    title: 'Status',
    cellProps: {
      width: '8%',
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
          <Id
            href={getTxURL(row.fromChain, row.sourceTxId)!}
            id={row.sourceTxId}
          />
        </EnhancedTableCell>
      </TableRow>
      {expand && (
        <>
          <TableRow sx={isLoading ? { opacity: 0.3 } : {}}>
            <EnhancedTableCell>Chain</EnhancedTableCell>
            <EnhancedTableCell>
              <Connector
                start={NETWORKS[row.fromChain].label}
                end={NETWORKS[row.toChain].label}
              />
            </EnhancedTableCell>
          </TableRow>
          <TableRow sx={isLoading ? { opacity: 0.3 } : {}}>
            <EnhancedTableCell>Height</EnhancedTableCell>
            <EnhancedTableCell>{row.height}</EnhancedTableCell>
          </TableRow>
          <TableRow sx={isLoading ? { opacity: 0.3 } : {}}>
            <EnhancedTableCell>Addresses</EnhancedTableCell>
            <EnhancedTableCell>
              <Connector
                start={<Id id={row.fromAddress} />}
                end={<Id id={row.toAddress} />}
              />
            </EnhancedTableCell>
          </TableRow>
          <TableRow sx={isLoading ? { opacity: 0.3 } : {}}>
            <EnhancedTableCell>Token</EnhancedTableCell>
            <EnhancedTableCell>{row.lockToken.name}</EnhancedTableCell>
          </TableRow>
          <TableRow sx={isLoading ? { opacity: 0.3 } : {}}>
            <EnhancedTableCell>Amount</EnhancedTableCell>
            <EnhancedTableCell>
              <Amount
                value={getDecimalString(
                  row.amount.toString(),
                  row.lockToken.significantDecimals,
                )}
              />
            </EnhancedTableCell>
          </TableRow>
          <TableRow sx={rowStyles}>
            <EnhancedTableCell>Bridge Fee</EnhancedTableCell>
            <EnhancedTableCell>
              <Amount
                value={getDecimalString(
                  row.bridgeFee.toString(),
                  row.lockToken.significantDecimals,
                )}
              />
            </EnhancedTableCell>
          </TableRow>
          <TableRow sx={rowStyles}>
            <EnhancedTableCell>Network Fee</EnhancedTableCell>
            <EnhancedTableCell>
              <Amount
                value={getDecimalString(
                  row.networkFee.toString(),
                  row.lockToken.significantDecimals,
                )}
              />
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

  return (
    <TableRow className="divider" sx={isLoading ? { opacity: 0.3 } : {}}>
      <EnhancedTableCell align="center">
        <Id id={row.eventId} />
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        <Id
          href={getTxURL(row.fromChain, row.sourceTxId)!}
          id={row.sourceTxId}
        />
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        <Connector
          start={NETWORKS[row.fromChain].label}
          end={NETWORKS[row.toChain].label}
        />
      </EnhancedTableCell>
      <EnhancedTableCell align="center">{row.height}</EnhancedTableCell>
      <EnhancedTableCell align="center">
        <Connector
          start={<Id id={row.fromAddress} />}
          end={<Id id={row.toAddress} />}
        />
      </EnhancedTableCell>
      <EnhancedTableCell align="center">{row.lockToken.name}</EnhancedTableCell>
      <EnhancedTableCell align="center">
        <Amount
          value={getDecimalString(
            row.amount.toString(),
            row.lockToken.significantDecimals,
          )}
        />
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        <Amount
          value={getDecimalString(
            row.bridgeFee.toString(),
            row.lockToken.significantDecimals,
          )}
        />
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        <Amount
          value={getDecimalString(
            row.networkFee.toString(),
            row.lockToken.significantDecimals,
          )}
        />
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
