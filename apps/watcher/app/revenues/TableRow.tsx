import { useState, FC, useMemo } from 'react';

import { AngleDown, AngleUp } from '@rosen-bridge/icons';
import {
  Amount,
  Box,
  Button,
  EnhancedTableCell,
  Id,
  styled,
  TableRow,
} from '@rosen-bridge/ui-kit';
import { getDecimalString } from '@rosen-ui/utils';

import { useERsnToken } from '@/_hooks/useERsnToken';
import { useRsnToken } from '@/_hooks/useRsnToken';
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
    title: 'Token',
    cellProps: {
      width: 150,
    },
  },
  {
    title: 'Income (RSN/eRSN)',
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
  const StyledBox = styled(Box)({
    'display': 'flex',
    'alignItems': 'center',
    '& > div:not(:last-child)::after': {
      content: '"+"',
      margin: '0 4px',
    },
  });

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

  const getRSNIncome = () => {
    const rsnTokenInfo = row.revenues.find(
      (token) => token.tokenId === rsnToken?.tokenId,
    );
    return getDecimalString(
      rsnTokenInfo?.amount.toString() ?? '0',
      rsnTokenInfo?.decimals ?? 0,
    );
  };

  const getTokenIncome = () =>
    row.revenues
      .filter((token) => token.tokenId !== rsnToken?.tokenId)
      .map((token) => ({
        value: getDecimalString(token.amount.toString(), token.decimals),
        unit: token.name,
      }));

  return (
    <>
      <TableRow sx={isLoading ? { opacity: 0.3 } : {}}>
        <EnhancedTableCell>Event Id</EnhancedTableCell>
        <EnhancedTableCell>
          <Id id={row.eventId} />
        </EnhancedTableCell>
      </TableRow>
      <TableRow sx={isLoading ? { opacity: 0.3 } : {}}>
        <EnhancedTableCell>Token</EnhancedTableCell>
        <EnhancedTableCell>{row.lockToken.name}</EnhancedTableCell>
      </TableRow>
      {expand && (
        <>
          <TableRow sx={rowStyles}>
            <EnhancedTableCell>RSN Income</EnhancedTableCell>
            <EnhancedTableCell>
              <Amount value={getRSNIncome()} size="normal" />
            </EnhancedTableCell>
          </TableRow>
          <TableRow sx={rowStyles}>
            <EnhancedTableCell>Token Income</EnhancedTableCell>
            <EnhancedTableCell>
              <StyledBox>
                {getTokenIncome().map((tokenIncome, index) => (
                  <Amount
                    key={index}
                    value={tokenIncome.value}
                    unit={tokenIncome.unit}
                    size="normal"
                  />
                ))}
              </StyledBox>
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
  const { eRsnToken, isLoading: isERsnTokenLoading } = useERsnToken();

  const isLoading = isLoadingProp || isRsnTokenLoading || isERsnTokenLoading;

  const getRSNIncome = () => {
    const rsnTokenInfo = row.revenues.find(
      (token) => token.tokenId === rsnToken?.tokenId,
    );
    const eRsnTokenInfo = row.revenues.find(
      (token) => token.tokenId === eRsnToken?.tokenId,
    );

    const amount = [rsnTokenInfo, eRsnTokenInfo]
      .map((info) => {
        return getDecimalString(
          info?.amount.toString() ?? '0',
          info?.decimals ?? 0,
        );
      })
      .reduce((sum, amount) => sum + parseFloat(amount), 0)
      .toString();

    return amount;
  };

  const getTokenIncome = () =>
    row.revenues
      .filter(
        (token) =>
          token.tokenId !== rsnToken?.tokenId &&
          token.tokenId !== eRsnToken?.tokenId,
      )
      .map((token) => ({
        value: getDecimalString(token.amount.toString(), token.decimals),
        unit: token.name,
      }));

  return (
    <TableRow className="divider" sx={isLoading ? { opacity: 0.3 } : {}}>
      <EnhancedTableCell>
        <Id id={row.eventId} />
      </EnhancedTableCell>
      <EnhancedTableCell>{row.lockToken.name}</EnhancedTableCell>
      <EnhancedTableCell>
        <Amount value={getRSNIncome()} size="normal" />
      </EnhancedTableCell>
      {getTokenIncome().map((tokenIncome, index) => (
        <EnhancedTableCell key={index}>
          <Amount
            value={tokenIncome.value}
            size="normal"
            unit={tokenIncome.unit}
          />
        </EnhancedTableCell>
      ))}
    </TableRow>
  );
};
