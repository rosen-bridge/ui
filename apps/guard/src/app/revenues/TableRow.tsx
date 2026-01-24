import { useState, FC, useMemo } from 'react';

import { AngleDown, AngleUp } from '@rosen-bridge/icons';
import {
  Amount,
  Button,
  EnhancedTableCell,
  Id,
  TableRow,
} from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';
import { getTxURL } from '@rosen-ui/utils';

import { useInfo } from '@/hooks';
import { Revenue } from '@/types/api';

interface RowProps extends Revenue {
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
      align: 'center' as const,
    },
  },
  {
    title: 'To Address',
    cellProps: {
      width: 150,
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
    title: 'Emission (RSN/eRSN)',
    cellProps: {
      width: 150,
      align: 'center' as const,
    },
  },
];

export const MobileRow: FC<RowProps> = (props) => {
  const { isLoading, ...row } = props;
  const [expand, setExpand] = useState(false);

  const { data: info, isLoading: isInfoLoading } = useInfo();

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
          <Id id={row.eventId} />
        </EnhancedTableCell>
      </TableRow>
      <TableRow style={rowStyles}>
        <EnhancedTableCell>Lock TX Id</EnhancedTableCell>
        <EnhancedTableCell>
          <Id id={row.lockTxId} href={getTxURL(row.fromChain, row.lockTxId)} />
        </EnhancedTableCell>
      </TableRow>
      {expand && (
        <>
          <TableRow style={rowStyles}>
            <EnhancedTableCell>Reward TX Id</EnhancedTableCell>
            <EnhancedTableCell>
              <Id
                id={row.rewardTxId}
                href={getTxURL(NETWORKS.ergo.key, row.rewardTxId)}
              />
            </EnhancedTableCell>
          </TableRow>
          <TableRow style={rowStyles}>
            <EnhancedTableCell>From Address</EnhancedTableCell>
            <EnhancedTableCell>
              <Id id={row.fromAddress} />
            </EnhancedTableCell>
          </TableRow>
          <TableRow style={rowStyles}>
            <EnhancedTableCell>To Address</EnhancedTableCell>
            <EnhancedTableCell>
              <Id id={row.toAddress} />
            </EnhancedTableCell>
          </TableRow>
          <TableRow style={rowStyles}>
            <EnhancedTableCell>Token</EnhancedTableCell>
            <EnhancedTableCell>{row.lockToken.name}</EnhancedTableCell>
          </TableRow>
          <TableRow style={rowStyles}>
            <EnhancedTableCell>Amount</EnhancedTableCell>
            <EnhancedTableCell>
              <Amount
                value={row.lockToken.amount}
                decimal={row.lockToken.decimals}
              />
            </EnhancedTableCell>
          </TableRow>
          <TableRow style={rowStyles}>
            <EnhancedTableCell>Bridge Fee (RSN)</EnhancedTableCell>
            <EnhancedTableCell>
              <Amount
                value={
                  row.revenues.find(
                    (revenue) =>
                      revenue.revenueType === 'bridge-fee' &&
                      revenue.data.tokenId === row.ergoSideTokenId,
                  )?.data.amount
                }
                fallback="0"
                decimal={row.lockToken.decimals}
              />
            </EnhancedTableCell>
          </TableRow>
          <TableRow style={rowStyles}>
            <EnhancedTableCell>Network Fee (RSN)</EnhancedTableCell>
            <EnhancedTableCell>
              <Amount
                value={
                  row.revenues.find(
                    (revenue) =>
                      revenue.revenueType === 'network-fee' &&
                      revenue.data.tokenId === row.ergoSideTokenId,
                  )?.data.amount
                }
                fallback="0"
                decimal={row.lockToken.decimals}
              />
            </EnhancedTableCell>
          </TableRow>
          <TableRow style={rowStyles}>
            <EnhancedTableCell>Emission (RSN)</EnhancedTableCell>
            <EnhancedTableCell>
              <Amount
                value={
                  row.revenues.find(
                    (revenue) =>
                      revenue.revenueType === 'emission' &&
                      (revenue.data.tokenId === info?.rsnTokenId ||
                        revenue.data.tokenId === info?.emissionTokenId),
                  )?.data.amount
                }
                fallback="0"
                decimal={row.lockToken.decimals}
                loading={isInfoLoading}
              />
            </EnhancedTableCell>
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

  const { data: info, isLoading: isInfoLoading } = useInfo();

  const rowStyles = useMemo(
    () => (isLoading ? { opacity: 0.3 } : {}),
    [isLoading],
  );

  return (
    <TableRow className="divider" style={rowStyles}>
      <EnhancedTableCell>
        <Id id={row.eventId} />
      </EnhancedTableCell>
      <EnhancedTableCell>
        <Id id={row.lockTxId} href={getTxURL(row.fromChain, row.lockTxId)} />
      </EnhancedTableCell>
      <EnhancedTableCell>
        <Id
          id={row.rewardTxId}
          href={getTxURL(NETWORKS.ergo.key, row.rewardTxId)}
        />
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        <Id id={row.fromAddress} />
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        <Id id={row.toAddress} />
      </EnhancedTableCell>
      <EnhancedTableCell align="center">{row.lockToken.name}</EnhancedTableCell>
      <EnhancedTableCell align="center">
        <Amount value={row.lockToken.amount} decimal={row.lockToken.decimals} />
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        <Amount
          value={
            row.revenues.find(
              (revenue) =>
                revenue.revenueType === 'bridge-fee' &&
                revenue.data.tokenId === row.ergoSideTokenId,
            )?.data.amount
          }
          fallback="0"
          decimal={row.lockToken.decimals}
        />
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        <Amount
          value={
            row.revenues.find(
              (revenue) =>
                revenue.revenueType === 'network-fee' &&
                revenue.data.tokenId === row.ergoSideTokenId,
            )?.data.amount
          }
          fallback="0"
          decimal={row.lockToken.decimals}
        />
      </EnhancedTableCell>
      <EnhancedTableCell style={rowStyles} align="center">
        <Amount
          value={row.revenues
            .filter(
              (revenue) =>
                revenue.revenueType === 'emission' &&
                (revenue.data.tokenId === info?.rsnTokenId ||
                  revenue.data.tokenId === info?.emissionTokenId),
            )
            .reduce((sum, revenue) => sum + revenue.data.amount, 0)}
          fallback="0"
          decimal={row.lockToken.decimals}
          loading={isInfoLoading}
        />
      </EnhancedTableCell>
    </TableRow>
  );
};
