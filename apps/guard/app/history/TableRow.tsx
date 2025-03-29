import { useState, FC, useMemo } from 'react';

import { AngleDown, AngleUp } from '@rosen-bridge/icons';
import {
  Button,
  EnhancedTableCell,
  TableRow,
  Id,
  Connector,
  Amount,
} from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';
import { getDecimalString, getTxURL } from '@rosen-ui/utils';

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
    title: 'Reward TX Id',
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
            <EnhancedTableCell>Reward TX Id</EnhancedTableCell>
            <EnhancedTableCell>
              <Id
                id={row.rewardTxId}
                href={getTxURL(NETWORKS.ergo.key, row.rewardTxId)!}
              />
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
              <Amount
                value={getDecimalString(
                  row.sourceChainToken.amount.toString(),
                  row.sourceChainToken.decimals,
                )}
              />
            </EnhancedTableCell>
          </TableRow>
          <TableRow sx={rowStyles}>
            <EnhancedTableCell>Bridge Fee</EnhancedTableCell>
            <EnhancedTableCell>
              <Amount
                value={getDecimalString(
                  row.bridgeFee,
                  row.sourceChainToken.decimals,
                )}
              />
            </EnhancedTableCell>
          </TableRow>
          <TableRow sx={rowStyles}>
            <EnhancedTableCell>Network Fee</EnhancedTableCell>
            <EnhancedTableCell>
              <Amount
                value={getDecimalString(
                  row.networkFee,
                  row.sourceChainToken.decimals,
                )}
              />
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
          id={row.sourceTxId}
          href={getTxURL(row.fromChain, row.sourceTxId)!}
        />
      </EnhancedTableCell>
      <EnhancedTableCell>
        <Id
          id={row.rewardTxId}
          href={getTxURL(NETWORKS.ergo.key, row.rewardTxId)!}
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
          start={<Id id={row.fromAddress} />}
          end={<Id id={row.toAddress} />}
        />
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        {row.sourceChainToken.name}
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        <Amount
          value={getDecimalString(
            row.sourceChainToken.amount.toString(),
            row.sourceChainToken.decimals,
          )}
        />
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        <Amount
          value={getDecimalString(row.bridgeFee, row.sourceChainToken.decimals)}
        />
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        <Amount
          value={getDecimalString(
            row.networkFee,
            row.sourceChainToken.decimals,
          )}
        />
      </EnhancedTableCell>
      <EnhancedTableCell align="center">{row.status}</EnhancedTableCell>
    </TableRow>
  );
};
