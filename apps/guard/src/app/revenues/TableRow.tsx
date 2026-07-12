import { type FC, useMemo, useState } from 'react';

import { AngleDown, AngleUp } from '@rosen-bridge/icons';
import {
  Amount,
  Button,
  EnhancedTableCell,
  Identifier,
  TableRow,
} from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';
import { getDecimalString, getTxURL } from '@rosen-ui/utils';

import { useInfo } from '@/hooks';
import type { ApiInfoResponse, Revenue } from '@/types/api';

const getEmissionAmount = (
  info: ApiInfoResponse | undefined,
  row: RowProps,
) => {
  if (!info) return;

  const revenues = row.revenues.filter(
    (revenue) =>
      revenue.revenueType === 'emission' &&
      (revenue.data.tokenId === info?.rsnTokenId ||
        revenue.data.tokenId === info?.emissionTokenId),
  );

  const amount = revenues.reduce(
    (sum, revenue) => sum + revenue.data.amount,
    0,
  );

  const decimals = revenues.at(0)?.data.decimals;

  return getDecimalString(amount, decimals);
};

interface RowProps extends Revenue {
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
          <Identifier value={row.eventId} variant="legacy" />
        </EnhancedTableCell>
      </TableRow>
      <TableRow style={rowStyles}>
        <EnhancedTableCell>Lock TX Id</EnhancedTableCell>
        <EnhancedTableCell>
          <Identifier
            value={row.lockTxId}
            href={getTxURL(row.fromChain, row.lockTxId)}
            variant="legacy"
          />
        </EnhancedTableCell>
      </TableRow>
      {expand && (
        <>
          <TableRow style={rowStyles}>
            <EnhancedTableCell>Reward TX Id</EnhancedTableCell>
            <EnhancedTableCell>
              <Identifier
                value={row.rewardTxId}
                href={getTxURL(NETWORKS.ergo.key, row.rewardTxId)}
                variant="legacy"
              />
            </EnhancedTableCell>
          </TableRow>
          <TableRow style={rowStyles}>
            <EnhancedTableCell>From Address</EnhancedTableCell>
            <EnhancedTableCell>
              <Identifier value={row.fromAddress} variant="legacy" />
            </EnhancedTableCell>
          </TableRow>
          <TableRow style={rowStyles}>
            <EnhancedTableCell>To Address</EnhancedTableCell>
            <EnhancedTableCell>
              <Identifier value={row.toAddress} variant="legacy" />
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
                value={getEmissionAmount(info, row)}
                fallback="0"
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
        <Identifier value={row.eventId} variant="legacy" />
      </EnhancedTableCell>
      <EnhancedTableCell>
        <Identifier
          value={row.lockTxId}
          href={getTxURL(row.fromChain, row.lockTxId)}
          variant="legacy"
        />
      </EnhancedTableCell>
      <EnhancedTableCell>
        <Identifier
          value={row.rewardTxId}
          href={getTxURL(NETWORKS.ergo.key, row.rewardTxId)}
          variant="legacy"
        />
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        <Identifier value={row.fromAddress} variant="legacy" />
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        <Identifier value={row.toAddress} variant="legacy" />
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
          value={getEmissionAmount(info, row)}
          fallback="0"
          loading={isInfoLoading}
        />
      </EnhancedTableCell>
    </TableRow>
  );
};
