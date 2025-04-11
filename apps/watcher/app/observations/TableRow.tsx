import { useState, FC, useMemo } from 'react';

import { AngleDown, AngleUp } from '@rosen-bridge/icons';
import { Button, EnhancedTableCell, Id, TableRow } from '@rosen-bridge/ui-kit';
import { Network } from '@rosen-ui/types';
import { getDecimalString, getTxURL } from '@rosen-ui/utils';

import { Observation } from '@/_types/api';

interface RowProps extends Observation {
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
    title: 'Tx Id',
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
    title: 'Height',
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
    title: 'Event Id',
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
        <EnhancedTableCell>Tx Id</EnhancedTableCell>
        <EnhancedTableCell>
          <Id
            id={row.sourceTxId}
            href={getTxURL(row.fromChain, row.sourceTxId)!}
          />
        </EnhancedTableCell>
      </TableRow>
      <TableRow sx={isLoading ? { opacity: 0.3 } : {}}>
        <EnhancedTableCell>Token</EnhancedTableCell>
        <EnhancedTableCell>{row.lockToken.name}</EnhancedTableCell>
      </TableRow>
      {expand && (
        <>
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
          <TableRow sx={rowStyles}>
            <EnhancedTableCell>Height</EnhancedTableCell>
            <EnhancedTableCell>{row.height}</EnhancedTableCell>
          </TableRow>
          <TableRow sx={isLoading ? { opacity: 0.3 } : {}}>
            <EnhancedTableCell>Amount</EnhancedTableCell>
            <EnhancedTableCell>
              {getDecimalString(row.amount, row.lockToken.decimals)}
            </EnhancedTableCell>
          </TableRow>
          <TableRow sx={rowStyles}>
            <EnhancedTableCell>Bridge Fee</EnhancedTableCell>
            <EnhancedTableCell>
              {getDecimalString(row.bridgeFee, row.lockToken.decimals)}
            </EnhancedTableCell>
          </TableRow>
          <TableRow sx={rowStyles}>
            <EnhancedTableCell>Network Fee</EnhancedTableCell>
            <EnhancedTableCell>
              {getDecimalString(row.networkFee, row.lockToken.decimals)}
            </EnhancedTableCell>
          </TableRow>
          <TableRow sx={rowStyles}>
            <EnhancedTableCell>Event Id</EnhancedTableCell>
            <EnhancedTableCell>
              <Id id={row.requestId} />
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
        <Id
          id={row.sourceTxId}
          href={getTxURL(row.fromChain, row.sourceTxId)!}
        />
      </EnhancedTableCell>
      <EnhancedTableCell align="center">{row.lockToken.name}</EnhancedTableCell>
      <EnhancedTableCell align="center">
        <Id id={row.fromAddress} />
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        <Id id={row.toAddress} />
      </EnhancedTableCell>
      <EnhancedTableCell align="center">{row.height}</EnhancedTableCell>
      <EnhancedTableCell align="center">
        {getDecimalString(row.amount, row.lockToken.decimals)}
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        {getDecimalString(row.bridgeFee, row.lockToken.decimals)}
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        {getDecimalString(row.networkFee, row.lockToken.decimals)}
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        <Id id={row.requestId} />
      </EnhancedTableCell>
    </TableRow>
  );
};
