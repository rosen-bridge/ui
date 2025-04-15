import { useState, FC, useMemo } from 'react';

import { AngleDown, AngleUp } from '@rosen-bridge/icons';
import {
  Amount,
  Box,
  Button,
  CircularProgress,
  Collapse,
  Divider,
  EnhancedTableCell,
  IconButton,
  Id,
  Stack,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableRow,
  WithExternalLink,
} from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';
import { fetcher } from '@rosen-ui/swr-helpers';
import { getAddressUrl, getDecimalString, getTokenUrl } from '@rosen-ui/utils';
import useSWR from 'swr';

import { ApiAssetResponse, Assets } from '@/_types';

import { LOCK_ADDRESSES } from '../../configs';

interface RowProps extends Assets {
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
    title: 'Name',
    cellProps: {
      width: '20%',
      align: 'left' as const,
    },
  },
  {
    title: 'Network',
    cellProps: {
      width: '15%',
      align: 'left' as const,
    },
  },
  {
    title: 'Locked',
    cellProps: {
      width: '15%',
      align: 'left' as const,
    },
  },
  {
    title: 'Hot',
    cellProps: {
      width: '15%',
      align: 'left' as const,
    },
  },
  {
    title: 'Cold',
    cellProps: {
      width: '15%',
      align: 'left' as const,
    },
  },
  {
    title: 'Bridged',
    cellProps: {
      width: '15%',
      align: 'left' as const,
    },
  },
  {
    title: '',
    cellProps: {
      width: '5%',
      align: 'left' as const,
    },
  },
];

export const MobileRow: FC<RowProps> = (props) => {
  const { isLoading, ...row } = props;

  const [expand, setExpand] = useState(false);

  const [open, setOpen] = useState(false);

  const rowStyles = useMemo(
    () => ({
      'opacity': isLoading ? 0.3 : 1.0,
      '& > td': {
        border: 0,
        padding: 1,
      },
    }),
    [isLoading],
  );

  const toggleExpand = () => {
    setExpand((prevState) => !prevState);
  };

  const hot = row.lockedPerAddress?.find((item) => {
    return Object.values(LOCK_ADDRESSES).includes(item.address) == true;
  });

  const hotUrl = getAddressUrl(row.chain, hot?.address);

  const cold = row.lockedPerAddress?.find((item) => {
    return Object.values(LOCK_ADDRESSES).includes(item.address) != true;
  });

  const coldUrl = getAddressUrl(row.chain, cold?.address);

  return (
    <>
      <TableRow sx={rowStyles}>
        <EnhancedTableCell sx={{ opacity: '0.6' }}>Name</EnhancedTableCell>
        <EnhancedTableCell>{row.name}</EnhancedTableCell>
      </TableRow>
      <TableRow sx={rowStyles}>
        <EnhancedTableCell sx={{ opacity: '0.6' }}>Network</EnhancedTableCell>
        <EnhancedTableCell>{row.chain}</EnhancedTableCell>
      </TableRow>
      <TableRow sx={rowStyles}>
        <EnhancedTableCell sx={{ opacity: '0.6' }}>Locked</EnhancedTableCell>
        <EnhancedTableCell>
          <Amount
            value={getDecimalString(
              ((hot?.amount || 0) + (cold?.amount || 0)).toString(),
              row.decimal,
            )}
          />
        </EnhancedTableCell>
      </TableRow>
      {expand && (
        <>
          <TableRow sx={rowStyles}>
            <EnhancedTableCell sx={{ opacity: '0.6' }}>Hot</EnhancedTableCell>
            <EnhancedTableCell>
              <Amount
                value={getDecimalString(
                  hot?.amount.toString() || '0',
                  row.decimal,
                )}
              />
            </EnhancedTableCell>
          </TableRow>
          <TableRow sx={rowStyles}>
            <EnhancedTableCell sx={{ opacity: '0.6' }}>Cold</EnhancedTableCell>
            <EnhancedTableCell>
              <Amount
                value={getDecimalString(
                  cold?.amount.toString() || '0',
                  row.decimal,
                )}
              />
            </EnhancedTableCell>
          </TableRow>
          <TableRow sx={rowStyles}>
            <EnhancedTableCell sx={{ opacity: '0.6' }}>
              Bridged
            </EnhancedTableCell>
            <EnhancedTableCell>
              <Amount
                value={getDecimalString(row.bridged || '0', row.decimal)}
              />
            </EnhancedTableCell>
          </TableRow>
        </>
      )}
      <TableRow
        sx={{
          'opacity': isLoading ? 0.3 : 1.0,
          '& > td': {
            border: 0,
          },
        }}
      >
        <EnhancedTableCell padding="none">
          <Button
            variant="text"
            sx={{ fontSize: 'inherit' }}
            endIcon={expand ? <AngleUp /> : <AngleDown />}
            onClick={toggleExpand}
          >
            {expand ? 'Show less' : 'Show more'}
          </Button>
        </EnhancedTableCell>
      </TableRow>
    </>
  );
};

export const TabletRow: FC<RowProps> = (props) => {
  const { isLoading, ...row } = props;

  const [expanded, setExpanded] = useState(false);

  const { data, isLoading: loading } = useSWR<ApiAssetResponse>(
    expanded ? `/v1/assets/detail/${row.id.toLowerCase()}` : null,
    fetcher,
  );

  const hot = row.lockedPerAddress?.find((item) => {
    return Object.values(LOCK_ADDRESSES).includes(item.address) == true;
  });

  const hotUrl = getAddressUrl(row.chain, hot?.address);

  /**
   * TODO: utilize an appropriate method to identify the cold address and its corresponding amounts
   * local:ergo/rosen-bridge/ui#453
   */
  const cold = [...(row.lockedPerAddress || [])]
    .sort((a, b) => b.address.localeCompare(a.address))
    .find((item) => {
      return Object.values(LOCK_ADDRESSES).includes(item.address) != true;
    });

  const coldUrl = getAddressUrl(row.chain, cold?.address);

  const open = expanded && data && !loading;

  const tokenUrl =
    !row.isNative &&
    getTokenUrl(
      row.chain,
      row.chain == NETWORKS.cardano.key ? row.id.replace('.', '') : row.id,
    );

  return (
    <>
      <TableRow
        className="divider"
        sx={{
          'opacity': isLoading ? 0.3 : 1.0,
          '& > td': { border: 0 },
        }}
        onClick={() => setExpanded(!open)}
      >
        <EnhancedTableCell align="left">
          <WithExternalLink url={tokenUrl ? tokenUrl : undefined}>
            {row.name}
          </WithExternalLink>
        </EnhancedTableCell>
        <EnhancedTableCell align="left">{row.chain}</EnhancedTableCell>
        <EnhancedTableCell align="left">
          <Amount
            value={getDecimalString(
              ((hot?.amount || 0) + (cold?.amount || 0)).toString(),
              row.significantDecimals,
            )}
          />
        </EnhancedTableCell>
        <EnhancedTableCell align="left">
          <WithExternalLink url={hotUrl}>
            <Amount
              value={getDecimalString(
                hot?.amount.toString() || '0',
                row.significantDecimals,
              )}
            />
          </WithExternalLink>
        </EnhancedTableCell>
        <EnhancedTableCell align="left">
          <WithExternalLink url={coldUrl}>
            <Amount
              value={getDecimalString(
                cold?.amount.toString() || '0',
                row.significantDecimals,
              )}
            />
          </WithExternalLink>
        </EnhancedTableCell>
        <EnhancedTableCell align="left">
          <Amount
            value={getDecimalString(
              row.bridged || '0',
              row.significantDecimals,
            )}
          />
        </EnhancedTableCell>
        <EnhancedTableCell align="right">
          <IconButton
            size="small"
            disabled={loading}
            sx={{
              transform: !open ? 'rotate(0deg)' : 'rotate(180deg)',
              marginLeft: 'auto',
              transition: (theme) => {
                return theme.transitions.create('transform', {
                  duration: theme.transitions.duration.shortest,
                });
              },
            }}
            onClick={() => setExpanded(!open)}
          >
            {loading ? (
              <CircularProgress color="inherit" size={24} />
            ) : (
              <SvgIcon>
                <AngleDown />
              </SvgIcon>
            )}
          </IconButton>
        </EnhancedTableCell>
      </TableRow>
      <TableRow
        sx={{
          'opacity': isLoading ? 0.3 : 1.0,
          '&:last-child td': { border: 0 },
        }}
      >
        <EnhancedTableCell colSpan={10} padding="none">
          <Collapse in={open} unmountOnExit>
            <Divider variant="middle" sx={{ borderBottomStyle: 'dashed' }} />
            {data && (
              <Box sx={{ m: 2 }}>
                {data.bridged && (
                  <Table>
                    <TableBody>
                      {data.bridged.map((item) => {
                        const tokenUrl = getTokenUrl(
                          item.chain,
                          item.chain == NETWORKS.cardano.key
                            ? item.birdgedTokenId.replace('.', '')
                            : item.birdgedTokenId,
                        );
                        return (
                          <TableRow
                            key={item.chain}
                            sx={{ '&:last-child td': { border: 0 } }}
                          >
                            <TableCell>{item.chain}</TableCell>
                            <TableCell>
                              <Amount
                                value={getDecimalString(
                                  item.amount,
                                  row.significantDecimals,
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <Stack
                                alignItems="center"
                                direction="row"
                                gap={1}
                              >
                                <Id
                                  id={item.birdgedTokenId}
                                  href={tokenUrl || undefined}
                                />
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </Box>
            )}
          </Collapse>
        </EnhancedTableCell>
      </TableRow>
    </>
  );
};
