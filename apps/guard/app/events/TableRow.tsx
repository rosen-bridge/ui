import { useState, FC, useMemo } from 'react';

import { AngleDown, AngleUp } from '@rosen-bridge/icons';
import {
  Button,
  EnhancedTableCell,
  TableRow,
  Id,
  Connector,
} from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';
import { getDecimalString, getTxURL } from '@rosen-ui/utils';

import { OngoingEvent } from '@/_types/api';

interface RowProps extends OngoingEvent {
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
      align: 'center' as const,
    },
  },
  {
    title: 'Lock TX Id',
    cellProps: {
      align: 'center' as const,
    },
  },
  {
    title: 'Trigger TX Id',
    cellProps: {
      align: 'center' as const,
    },
  },
  {
    title: 'Chain',
    cellProps: {
      align: 'center' as const,
    },
  },
  {
    title: 'Addresses',
    cellProps: {
      align: 'center' as const,
    },
  },
  {
    title: 'Token',
    cellProps: {
      align: 'center' as const,
    },
  },
  {
    title: 'Amount',
    cellProps: {
      align: 'center' as const,
    },
  },
  {
    title: 'Bridge Fee',
    cellProps: {
      align: 'center' as const,
    },
  },
  {
    title: 'Network Fee',
    cellProps: {
      align: 'center' as const,
    },
  },
  {
    title: 'Status',
    cellProps: {
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
            <EnhancedTableCell>Trigger TX Id</EnhancedTableCell>
            <EnhancedTableCell>
              <Id id={row.txId} href={getTxURL(NETWORKS.ergo.key, row.txId)!} />
            </EnhancedTableCell>
          </TableRow>
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
            <EnhancedTableCell>{row.sourceChainToken.name}</EnhancedTableCell>
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
        <Id id={row.txId} href={getTxURL(NETWORKS.ergo.key, row.txId)!} />
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        <Connector
          start={NETWORKS[row.fromChain].label}
          end={NETWORKS[row.toChain].label}
        />
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        <Connector
          start={<Id id={row.fromAddress} />}
          end={<Id id={row.toAddress} />}
        />
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        {row.sourceChainToken.name}
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        {getDecimalString(
          row.sourceChainToken.amount.toString(),
          row.sourceChainToken.decimals,
        )}
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        {getDecimalString(row.bridgeFee, row.sourceChainToken.decimals)}
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        {getDecimalString(row.networkFee, row.sourceChainToken.decimals)}
      </EnhancedTableCell>
      <EnhancedTableCell align="center">{row.status}</EnhancedTableCell>
    </TableRow>
  );
};
