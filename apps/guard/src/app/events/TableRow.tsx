import { type FC, useMemo, useState } from 'react';

import { AngleDown, AngleUp } from '@rosen-bridge/icons';
import {
  Amount,
  Button,
  Connector,
  EnhancedTableCell,
  Identifier,
  TableRow,
} from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';
import { getTxURL } from '@rosen-ui/utils';

import type { OngoingEvent } from '@/types/api';

interface RowProps extends OngoingEvent {
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
    title: 'Event Id',
    cellProps: {
      width: 120,
      align: 'center' as const,
    },
  },
  {
    title: 'Lock TX Id',
    cellProps: {
      width: 120,
      align: 'center' as const,
    },
  },
  {
    title: 'Trigger TX Id',
    cellProps: {
      width: 120,
      align: 'center' as const,
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
      align: 'center' as const,
    },
  },
  {
    title: 'Amount',
    cellProps: {
      width: 120,
      align: 'center' as const,
    },
  },
  {
    title: 'Bridge Fee',
    cellProps: {
      width: 120,
      align: 'center' as const,
    },
  },
  {
    title: 'Network Fee',
    cellProps: {
      width: 120,
      align: 'center' as const,
    },
  },
  {
    title: 'Status',
    cellProps: {
      width: 120,
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
        <EnhancedTableCell>Event Id</EnhancedTableCell>
        <EnhancedTableCell>
          <Identifier value={row.eventId} variant="legacy" />
        </EnhancedTableCell>
      </TableRow>
      <TableRow style={rowStyles}>
        <EnhancedTableCell>Lock TX Id</EnhancedTableCell>
        <EnhancedTableCell>
          <Identifier
            href={getTxURL(row.fromChain, row.sourceTxId)}
            value={row.sourceTxId}
            variant="legacy"
          />
        </EnhancedTableCell>
      </TableRow>
      {expand && (
        <>
          <TableRow style={rowStyles}>
            <EnhancedTableCell>Trigger TX Id</EnhancedTableCell>
            <EnhancedTableCell>
              <Identifier
                value={row.txId}
                href={getTxURL(NETWORKS.ergo.key, row.txId)}
                variant="legacy"
              />
            </EnhancedTableCell>
          </TableRow>
          <TableRow style={rowStyles}>
            <EnhancedTableCell>Chain</EnhancedTableCell>
            <EnhancedTableCell>
              <Connector
                start={NETWORKS[row.fromChain].label}
                end={NETWORKS[row.toChain].label}
              />
            </EnhancedTableCell>
          </TableRow>
          <TableRow style={rowStyles}>
            <EnhancedTableCell>Addresses</EnhancedTableCell>
            <EnhancedTableCell>
              <Connector
                start={<Identifier value={row.fromAddress} variant="legacy" />}
                end={<Identifier value={row.toAddress} variant="legacy" />}
              />
            </EnhancedTableCell>
          </TableRow>
          <TableRow style={rowStyles}>
            <EnhancedTableCell>Token</EnhancedTableCell>
            <EnhancedTableCell>{row.sourceChainToken.name}</EnhancedTableCell>
          </TableRow>
          <TableRow style={rowStyles}>
            <EnhancedTableCell>Amount</EnhancedTableCell>
            <EnhancedTableCell>
              <Amount
                value={row.sourceChainToken.amount}
                decimal={row.sourceChainToken.decimals}
              />
            </EnhancedTableCell>
          </TableRow>
          <TableRow style={rowStyles}>
            <EnhancedTableCell>Bridge Fee</EnhancedTableCell>
            <EnhancedTableCell>
              <Amount
                value={row.bridgeFee}
                decimal={row.sourceChainToken.decimals}
              />
            </EnhancedTableCell>
          </TableRow>
          <TableRow style={rowStyles}>
            <EnhancedTableCell>Network Fee</EnhancedTableCell>
            <EnhancedTableCell>
              <Amount
                value={row.networkFee}
                decimal={row.sourceChainToken.decimals}
              />
            </EnhancedTableCell>
          </TableRow>
          <TableRow style={rowStyles}>
            <EnhancedTableCell>Status</EnhancedTableCell>
            <EnhancedTableCell>{row.status}</EnhancedTableCell>
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
        <Identifier value={row.eventId} variant="legacy" />
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        <Identifier
          href={getTxURL(row.fromChain, row.sourceTxId)}
          value={row.sourceTxId}
          variant="legacy"
        />
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        <Identifier
          value={row.txId}
          href={getTxURL(NETWORKS.ergo.key, row.txId)}
          variant="legacy"
        />
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        <Connector
          start={NETWORKS[row.fromChain].label}
          end={NETWORKS[row.toChain].label}
        />
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        <Connector
          start={<Identifier value={row.fromAddress} variant="legacy" />}
          end={<Identifier value={row.toAddress} variant="legacy" />}
        />
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        {row.sourceChainToken.name}
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        <Amount
          value={row.sourceChainToken.amount}
          decimal={row.sourceChainToken.decimals}
        />
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        <Amount value={row.bridgeFee} decimal={row.sourceChainToken.decimals} />
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        <Amount
          value={row.networkFee}
          decimal={row.sourceChainToken.decimals}
        />
      </EnhancedTableCell>
      <EnhancedTableCell align="center">{row.status}</EnhancedTableCell>
    </TableRow>
  );
};
