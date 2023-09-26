import { useState, FC, useMemo } from 'react';

import { Button, EnhancedTableCell, TableRow } from '@rosen-bridge/ui-kit';

import { AngleDown, AngleUp } from '@rosen-bridge/icons';

import useRsnToken from '@/_hooks/useRsnToken';

import { Revenue } from '@/_types/api';

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
    title: 'Token Id',
    cellProps: {
      width: 150,
    },
  },
  {
    title: 'RSN Income',
    cellProps: {
      width: 150,
    },
  },
  {
    title: 'Token Income',
    cellProps: {
      width: 150,
    },
  },
];

export const MobileRow: FC<RowProps> = (props) => {
  const { isLoading: isLoadingProp, ...row } = props;
  const [expand, setExpand] = useState(false);

  const { rsnToken, isLoading: isRsnTokenLoading } = useRsnToken();

  const isLoading = isLoadingProp || isRsnTokenLoading;

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
        <EnhancedTableCell>{row.eventId.slice(0, 8)}</EnhancedTableCell>
      </TableRow>
      <TableRow sx={isLoading ? { opacity: 0.3 } : {}}>
        <EnhancedTableCell>Token Id</EnhancedTableCell>
        <EnhancedTableCell>{row.tokenId.slice(0, 8)}</EnhancedTableCell>
      </TableRow>
      {expand && (
        <>
          <TableRow sx={rowStyles}>
            <EnhancedTableCell>RSN Income</EnhancedTableCell>
            <EnhancedTableCell>
              {row.revenues.find((token) => token.tokenId === rsnToken?.tokenId)
                ?.amount ?? 0}
            </EnhancedTableCell>
          </TableRow>
          <TableRow sx={rowStyles}>
            <EnhancedTableCell>Token Income</EnhancedTableCell>
            <EnhancedTableCell>
              {row.revenues
                .filter((token) => token.tokenId !== rsnToken?.tokenId)
                .map((token) => `${token.amount}${token.name}`)
                .join('+')}
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
  const { isLoading: isLoadingProp, ...row } = props;

  const { rsnToken, isLoading: isRsnTokenLoading } = useRsnToken();

  const isLoading = isLoadingProp || isRsnTokenLoading;

  console.warn(rsnToken?.tokenId);

  return (
    <TableRow className="divider" sx={isLoading ? { opacity: 0.3 } : {}}>
      <EnhancedTableCell>{row.eventId.slice(0, 8)}</EnhancedTableCell>
      <EnhancedTableCell>{row.tokenId.slice(0, 8)}</EnhancedTableCell>
      <EnhancedTableCell>
        {row.revenues.find((token) => token.tokenId === rsnToken?.tokenId)
          ?.amount ?? 0}
      </EnhancedTableCell>
      <EnhancedTableCell>
        {row.revenues
          .filter((token) => token.tokenId !== rsnToken?.tokenId)
          .map((token) => `${token.amount} ${token.name ?? 'unnamed'}`)
          .join(' + ')}
      </EnhancedTableCell>
    </TableRow>
  );
};
