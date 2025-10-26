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

const StyledBox = styled(Box)({
  'display': 'inline-flex',
  'alignItems': 'center',
  '& > div:not(:last-child)::after': {
    content: '"+"',
    margin: '0 4px',
  },
});

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
    title: 'Income (RSN/eRSN)',
    cellProps: {
      width: 150,
      align: 'center' as const,
    },
  },
  {
    title: 'Token Income',
    cellProps: {
      width: 150,
      align: 'center' as const,
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
      <TableRow style={rowStyles}>
        <EnhancedTableCell>Event Id</EnhancedTableCell>
        <EnhancedTableCell>
          <Id id={row.eventId} />
        </EnhancedTableCell>
      </TableRow>
      <TableRow style={rowStyles}>
        <EnhancedTableCell>Token</EnhancedTableCell>
        <EnhancedTableCell>{row.lockToken.name}</EnhancedTableCell>
      </TableRow>
      {expand && (
        <>
          <TableRow style={rowStyles}>
            <EnhancedTableCell>RSN Income</EnhancedTableCell>
            <EnhancedTableCell>
              <Amount value={getRSNIncome()} />
            </EnhancedTableCell>
          </TableRow>
          <TableRow style={rowStyles}>
            <EnhancedTableCell>Token Income</EnhancedTableCell>
            <EnhancedTableCell>
              <StyledBox>
                {getTokenIncome().map((tokenIncome, index) => (
                  <Amount
                    key={index}
                    value={tokenIncome.value}
                    unit={tokenIncome.unit}
                  />
                ))}
              </StyledBox>
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
  const { isLoading: isLoadingProp, ...row } = props;

  const { rsnToken, isLoading: isRsnTokenLoading } = useRsnToken();
  const { eRsnToken, isLoading: isERsnTokenLoading } = useERsnToken();

  const isLoading = isLoadingProp || isRsnTokenLoading || isERsnTokenLoading;

  const rowStyles = useMemo(
    () => (isLoading ? { opacity: 0.3 } : {}),
    [isLoading],
  );

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
    <TableRow className="divider" style={rowStyles}>
      <EnhancedTableCell align="center">
        <Id id={row.eventId} />
      </EnhancedTableCell>
      <EnhancedTableCell align="center">{row.lockToken.name}</EnhancedTableCell>
      <EnhancedTableCell align="center">
        <Amount value={getRSNIncome()} />
      </EnhancedTableCell>
      <EnhancedTableCell align="center">
        <StyledBox>
          {getTokenIncome().map((tokenIncome, index) => (
            <Amount
              key={index}
              value={tokenIncome.value}
              unit={tokenIncome.unit}
            />
          ))}
        </StyledBox>
      </EnhancedTableCell>
    </TableRow>
  );
};
