import { useState, FC, useMemo } from 'react';
import useSWR from 'swr';

import {
  Button,
  CircularProgress,
  EnhancedTableCell,
  Link,
  TableRow,
} from '@rosen-bridge/ui-kit';

import { AngleDown, AngleUp } from '@rosen-bridge/icons';

import { fetcher } from '@rosen-ui/swr-helpers';
import { getDecimalString } from '@rosen-ui/utils';

import { CARDANO_BASE_TX_URL, ERGO_BASE_TX_URL } from '@/_constants';

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
    },
  },
  {
    title: 'To Address',
    cellProps: {
      width: 150,
    },
  },
  {
    title: 'Token',
    cellProps: {
      width: 150,
    },
  },
  {
    title: 'Amount',
    cellProps: {
      width: 150,
    },
  },
  {
    title: 'Bridge Fee (RSN)',
    cellProps: {
      width: 150,
    },
  },
  {
    title: 'Network Fee (RSN)',
    cellProps: {
      width: 150,
    },
  },
  {
    title: 'Emission (RSN)',
    cellProps: {
      width: 150,
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
          <Link href={`${baseTxUrl}${row.lockTxId}`} target="_blank">
            {row.lockTxId.slice(0, 10)}
          </Link>
        </EnhancedTableCell>
      </TableRow>
      {expand && (
        <>
          <TableRow sx={isLoading ? { opacity: 0.3 } : {}}>
            <EnhancedTableCell>Reward TX Id</EnhancedTableCell>
            <EnhancedTableCell>
              <Link
                href={`${ERGO_BASE_TX_URL}${row.rewardTxId}`}
                target="_blank"
              >
                {row.rewardTxId.slice(0, 10)}
              </Link>
            </EnhancedTableCell>
          </TableRow>
          <TableRow sx={isLoading ? { opacity: 0.3 } : {}}>
            <EnhancedTableCell>From Address</EnhancedTableCell>
            <EnhancedTableCell>
              {row.fromAddress.slice(0, 10)}
            </EnhancedTableCell>
          </TableRow>
          <TableRow sx={isLoading ? { opacity: 0.3 } : {}}>
            <EnhancedTableCell>To Address</EnhancedTableCell>
            <EnhancedTableCell>{row.toAddress.slice(0, 10)}</EnhancedTableCell>
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

  const baseTxUrl =
    row.fromChain === 'ergo' ? ERGO_BASE_TX_URL : CARDANO_BASE_TX_URL;

  return (
    <TableRow className="divider" sx={isLoading ? { opacity: 0.3 } : {}}>
      <EnhancedTableCell>{row.eventId.slice(0, 10)}</EnhancedTableCell>
      <EnhancedTableCell>
        <Link
          href={`${baseTxUrl}${row.lockTxId}`}
          target="_blank"
          color="textPrimary"
          underline="hover"
        >
          {row.lockTxId.slice(0, 10)}
        </Link>
      </EnhancedTableCell>
      <EnhancedTableCell>
        <Link
          href={`${ERGO_BASE_TX_URL}${row.rewardTxId}`}
          target="_blank"
          color="textPrimary"
          underline="hover"
        >
          {row.rewardTxId.slice(0, 10)}
        </Link>
      </EnhancedTableCell>
      <EnhancedTableCell>{row.fromAddress.slice(0, 10)}</EnhancedTableCell>
      <EnhancedTableCell>{row.toAddress.slice(0, 10)}</EnhancedTableCell>
      <EnhancedTableCell>{row.lockToken.name}</EnhancedTableCell>
      <EnhancedTableCell>
        {getDecimalString(
          row.lockToken.amount.toString(),
          row.lockToken.decimals,
        )}
      </EnhancedTableCell>
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
      <EnhancedTableCell sx={{ opacity: isInfoLoading ? 0.3 : 1 }}>
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
  );
};
