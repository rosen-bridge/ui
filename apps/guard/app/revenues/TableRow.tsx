import { useState, FC, useMemo } from 'react';

import { AngleDown, AngleUp } from '@rosen-bridge/icons';
import {
  Button,
  CircularProgress,
  EnhancedTableCell,
  Id,
  TableRow,
} from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';
import { fetcher } from '@rosen-ui/swr-helpers';
import { getDecimalString, getTxURL } from '@rosen-ui/utils';
import useSWR from 'swr';

import { Revenue, ApiInfoResponse } from '@/_types/api';

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
    title: 'Reward TX Id',
    cellProps: {
      align: 'center' as const,
    },
  },
  {
    title: 'From Address',
    cellProps: {
      align: 'center' as const,
    },
  },
  {
    title: 'To Address',
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
    title: 'Emission(RSN/eRSN)',
    cellProps: {
      align: 'center' as const,
    },
  },
];

export const MobileRow: FC<RowProps> = (props) => {
  const { isLoading, ...row } = props;
  const [expand, setExpand] = useState(false);

  const { data: info, isLoading: isInfoLoading } = useSWR<ApiInfoResponse>(
    '/info',
    fetcher,
  );

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
          <Id id={row.lockTxId} href={getTxURL(row.fromChain, row.lockTxId)!} />
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
            <EnhancedTableCell>From Address</EnhancedTableCell>
            <EnhancedTableCell>
              <Id id={row.fromAddress} />
            </EnhancedTableCell>
          </TableRow>
          <TableRow sx={isLoading ? { opacity: 0.3 } : {}}>
            <EnhancedTableCell>To Address</EnhancedTableCell>
            <EnhancedTableCell>
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
                row.lockToken.amount.toString(),
                row.lockToken.decimals,
              )}
            </EnhancedTableCell>
          </TableRow>
          <TableRow sx={rowStyles}>
            <EnhancedTableCell>Bridge Fee (RSN)</EnhancedTableCell>
            <EnhancedTableCell>
              {getDecimalString(
                row.revenues
                  .find(
                    (revenue) =>
                      revenue.revenueType === 'bridge-fee' &&
                      revenue.data.tokenId === row.ergoSideTokenId,
                  )
                  ?.data.amount.toString() ?? '',
                row.lockToken.decimals,
              )}
            </EnhancedTableCell>
          </TableRow>
          <TableRow sx={rowStyles}>
            <EnhancedTableCell>Network Fee (RSN)</EnhancedTableCell>
            <EnhancedTableCell>
              {getDecimalString(
                row.revenues
                  .find(
                    (revenue) =>
                      revenue.revenueType === 'network-fee' &&
                      revenue.data.tokenId === row.ergoSideTokenId,
                  )
                  ?.data.amount.toString() ?? '',
                row.lockToken.decimals,
              )}
            </EnhancedTableCell>
          </TableRow>
          <TableRow sx={rowStyles}>
            <EnhancedTableCell>Emission (RSN)</EnhancedTableCell>
            <EnhancedTableCell>
              {isInfoLoading ? (
                <CircularProgress color="inherit" size={10} />
              ) : (
                getDecimalString(
                  row.revenues
                    .find(
                      (revenue) =>
                        revenue.revenueType === 'emission' &&
                        revenue.data.tokenId === info?.rsnTokenId,
                    )
                    ?.data.amount.toString() ?? '',
                  row.lockToken.decimals,
                )
              )}
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

  const { data: info, isLoading: isInfoLoading } = useSWR<ApiInfoResponse>(
    '/info',
    fetcher,
  );

  return (
    <TableRow className="divider" sx={isLoading ? { opacity: 0.3 } : {}}>
      <EnhancedTableCell align="center">
        <Id id={row.eventId} />
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        <Id id={row.lockTxId} href={getTxURL(row.fromChain, row.lockTxId)!} />
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        <Id
          id={row.rewardTxId}
          href={getTxURL(NETWORKS.ergo.key, row.rewardTxId)!}
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
        {getDecimalString(
          row.lockToken.amount.toString(),
          row.lockToken.decimals,
        )}
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        {getDecimalString(
          row.revenues
            .find(
              (revenue) =>
                revenue.revenueType === 'bridge-fee' &&
                revenue.data.tokenId === row.ergoSideTokenId,
            )
            ?.data.amount.toString() ?? '',
          row.lockToken.decimals,
        )}
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        {getDecimalString(
          row.revenues
            .find(
              (revenue) =>
                revenue.revenueType === 'network-fee' &&
                revenue.data.tokenId === row.ergoSideTokenId,
            )
            ?.data.amount.toString() ?? '',
          row.lockToken.decimals,
        )}
      </EnhancedTableCell>
      <EnhancedTableCell
        align="center"
        sx={{ opacity: isInfoLoading ? 0.3 : 1 }}
      >
        {isInfoLoading ? (
          <CircularProgress color="inherit" size={10} />
        ) : (
          getDecimalString(
            row.revenues
              .filter(
                (revenue) =>
                  revenue.revenueType === 'emission' &&
                  (revenue.data.tokenId === info?.rsnTokenId ||
                    revenue.data.tokenId === info?.emissionTokenId),
              )
              .reduce((sum, revenue) => sum + revenue.data.amount, 0)
              .toString() ?? '',
            row.lockToken.decimals,
          )
        )}
      </EnhancedTableCell>
    </TableRow>
  );
};
