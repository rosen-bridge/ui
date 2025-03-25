import { useState, FC, useMemo } from 'react';

import { AngleDown, AngleUp } from '@rosen-bridge/icons';
import {
  Amount,
  Button,
  EnhancedTableCell,
  Id,
  TableRow,
  WithExternalLink,
} from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';
import { getAddressUrl, getDecimalString, getTokenUrl } from '@rosen-ui/utils';

import { useAddresses } from '@/_hooks/useAddresses';
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
    title: 'Amount (Hot)',
    cellProps: {
      width: 150,
    },
  },
  {
    title: 'Amount (Cold)',
    cellProps: {
      width: 150,
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
      <TableRow className="divider" sx={rowStyles}>
        <EnhancedTableCell>Id</EnhancedTableCell>
        <EnhancedTableCell>
          {row.isNativeToken ? '-' : <Id id={row.tokenId} />}
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
            <EnhancedTableCell>Amount (Hot)</EnhancedTableCell>
            <EnhancedTableCell>
              <Amount
                value={getDecimalString(row.amount.toString(), row.decimals)}
                size="normal"
              />
            </EnhancedTableCell>
          </TableRow>
          <TableRow sx={isLoading ? { opacity: 0.3 } : {}}>
            <EnhancedTableCell>Amount (Cold)</EnhancedTableCell>
            <EnhancedTableCell>
              <Amount
                value={getDecimalString(
                  row.coldAmount?.toString() ?? '0',
                  row.decimals,
                )}
                size="normal"
              />
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

  const addresses = useAddresses();

  const tokenUrl = getTokenUrl(
    row.chain,
    row.chain == NETWORKS.cardano.key
      ? row.tokenId.replace('.', '')
      : row.tokenId,
  );

  const coldUrl = getAddressUrl(row.chain, addresses.cold[row?.chain]);

  const hotUrl = getAddressUrl(row.chain, addresses.hot[row?.chain]);

  return (
    <TableRow className="divider" sx={isLoading ? { opacity: 0.3 } : {}}>
      <EnhancedTableCell>
        <WithExternalLink url={row.isNativeToken ? undefined : tokenUrl}>
          {row.isNativeToken ? '-' : <Id id={row.tokenId} />}
        </WithExternalLink>
      </EnhancedTableCell>
      <EnhancedTableCell>{row.name}</EnhancedTableCell>
      <EnhancedTableCell>{row.chain}</EnhancedTableCell>
      <EnhancedTableCell>
        <WithExternalLink url={hotUrl}>
          <Amount
            value={getDecimalString(row.amount.toString(), row.decimals)}
            size="normal"
          />
        </WithExternalLink>
      </EnhancedTableCell>
      <EnhancedTableCell>
        <WithExternalLink url={coldUrl}>
          <Amount
            value={getDecimalString(
              row.coldAmount?.toString() ?? '0',
              row.decimals,
            )}
            size="normal"
          />
        </WithExternalLink>
      </EnhancedTableCell>
    </TableRow>
  );
};
