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
      width: 120,
    },
  },
  {
    title: 'Lock TX Id',
    cellProps: {
      width: 120,
    },
  },
  {
    title: 'Trigger TX Id',
    cellProps: {
      width: 120,
    },
  },
  {
    title: 'Chain',
    cellProps: {
      width: 175,
      align: 'center' as const,
    },
  },
  {
    title: 'Addresses',
    cellProps: {
      width: 250,
      align: 'center' as const,
    },
  },
  {
    title: 'Token',
    cellProps: {
      width: 120,
    },
  },
  {
    title: 'Amount',
    cellProps: {
      width: 120,
    },
  },
  {
    title: 'Bridge Fee',
    cellProps: {
      width: 120,
    },
  },
  {
    title: 'Network Fee',
    cellProps: {
      width: 120,
    },
  },
  {
    title: 'Status',
    cellProps: {
      width: 120,
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
              <Id id={row.txId} href={getTxURL(NETWORKS.ERGO, row.txId)!} />
            </EnhancedTableCell>
          </TableRow>
          <TableRow sx={isLoading ? { opacity: 0.3 } : {}}>
            <EnhancedTableCell>Chain</EnhancedTableCell>
            <EnhancedTableCell>
              <Connector start={row.fromChain} end={row.toChain} />
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
      <EnhancedTableCell>
        <Id id={row.eventId} />
      </EnhancedTableCell>
      <EnhancedTableCell>
        <Id
          href={getTxURL(row.fromChain, row.sourceTxId)!}
          id={row.sourceTxId}
        />
      </EnhancedTableCell>
      <EnhancedTableCell>
        <Id id={row.txId} href={getTxURL(NETWORKS.ERGO, row.txId)!} />
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        <Connector start={row.fromChain} end={row.toChain} />
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        <Connector
          start={<Id id={row.fromAddress} />}
          end={<Id id={row.toAddress} />}
        />
      </EnhancedTableCell>
      <EnhancedTableCell>{row.sourceChainToken.name}</EnhancedTableCell>
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
