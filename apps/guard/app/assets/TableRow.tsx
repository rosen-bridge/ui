import { useState, FC, useMemo } from 'react';

import { Button, EnhancedTableCell, Id, TableRow } from '@rosen-bridge/ui-kit';

import { AngleDown, AngleUp } from '@rosen-bridge/icons';

import { getDecimalString } from '@rosen-ui/utils';

import { GuardTokenInfo } from '@/_types/api';

interface RowProps extends GuardTokenInfo {
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
    title: 'ID',
    cellProps: {
      width: 200,
    },
  },
  {
    title: 'Token name',
    cellProps: {
      width: 250,
    },
  },
  {
    title: 'Chain',
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
];

const renderValue = (value?: string | number | undefined) => {
  return value || '-';
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
      <TableRow className="divider" sx={rowStyles}>
        <EnhancedTableCell>Id</EnhancedTableCell>
        <EnhancedTableCell>
          {row.isNativeToken ? '-' : row.tokenId}
        </EnhancedTableCell>
      </TableRow>
      <TableRow sx={rowStyles}>
        <EnhancedTableCell>Token name</EnhancedTableCell>
        <EnhancedTableCell>{row.name}</EnhancedTableCell>
      </TableRow>
      <TableRow sx={rowStyles}>
        <EnhancedTableCell>Chain</EnhancedTableCell>
        <EnhancedTableCell>{row.chain}</EnhancedTableCell>
      </TableRow>
      {expand && (
        <>
          <TableRow sx={isLoading ? { opacity: 0.3 } : {}}>
            <EnhancedTableCell>Amount</EnhancedTableCell>
            <EnhancedTableCell>
              {getDecimalString(row.amount.toString(), row.decimals)}
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
      <EnhancedTableCell>
        {row.isNativeToken ? '-' : row.tokenId}
      </EnhancedTableCell>
      <EnhancedTableCell>{row.name}</EnhancedTableCell>
      <EnhancedTableCell>{row.chain}</EnhancedTableCell>
      <EnhancedTableCell>
        {getDecimalString(row.amount.toString(), row.decimals)}
      </EnhancedTableCell>
    </TableRow>
  );
};
