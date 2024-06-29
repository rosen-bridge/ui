import {
  AngleDown,
  AngleUp,
  SquareShape,
  Eye,
  OpenInNew,
} from '@rosen-bridge/icons';
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Collapse,
  Divider,
  EnhancedTableCell,
  Grid,
  IconButton,
  Id,
  Link,
  Stack,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@rosen-bridge/ui-kit';
import { useState, FC, useMemo } from 'react';
import useSWR from 'swr';
import { fetcher } from '@rosen-ui/swr-helpers';

import { ApiAssetResponse, Assets } from '@/_types/api';

import { DetailsDrawer } from './DetailsDrawer';
import { getDecimalString } from '@rosen-ui/utils';

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
      width: 200,
      align: 'left' as const,
    },
  },
  {
    title: 'Network',
    cellProps: {
      width: 150,
      align: 'center' as const,
    },
  },
  {
    title: 'Locked',
    cellProps: {
      width: 150,
      align: 'center' as const,
    },
  },
  {
    title: 'Hot',
    cellProps: {
      width: 150,
      align: 'center' as const,
    },
  },
  {
    title: 'Cold',
    cellProps: {
      width: 150,
      align: 'center' as const,
    },
  },
  {
    title: 'Bridged',
    cellProps: {
      width: 150,
      align: 'center' as const,
    },
  },
  {
    title: '',
    cellProps: {
      width: 100,
      align: 'center' as const,
    },
  },
];

export const MobileRow: FC<RowProps> = (props) => {
  const { isLoading, ...row } = props;

  const [expand, setExpand] = useState(false);

  const [open, setOpen] = useState(false);

  const rowStyles = useMemo(
    () => ({
      opacity: isLoading ? 0.3 : 1.0,
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

  return (
    <>
      <TableRow sx={rowStyles}>
        <EnhancedTableCell sx={{ opacity: '0.6' }}>Name</EnhancedTableCell>
        <EnhancedTableCell>{row.name}</EnhancedTableCell>
      </TableRow>
      <TableRow sx={rowStyles}>
        <EnhancedTableCell sx={{ opacity: '0.6' }}>Id</EnhancedTableCell>
        <EnhancedTableCell>
          <Id id={row.name} />
        </EnhancedTableCell>
      </TableRow>
      <TableRow sx={rowStyles}>
        <EnhancedTableCell sx={{ opacity: '0.6' }}>Type</EnhancedTableCell>
        <EnhancedTableCell>{row.chain}</EnhancedTableCell>
      </TableRow>
      {expand && (
        <>
          <TableRow sx={rowStyles}>
            <EnhancedTableCell sx={{ opacity: '0.6' }}>
              Locked
            </EnhancedTableCell>
            <EnhancedTableCell>
              {getDecimalString(row.locked, row.decimal)}
            </EnhancedTableCell>
          </TableRow>
          <TableRow sx={rowStyles}>
            <EnhancedTableCell sx={{ opacity: '0.6' }}>
              Bridged
            </EnhancedTableCell>
            <EnhancedTableCell>
              {getDecimalString(row.bridged, row.decimal)}
            </EnhancedTableCell>
          </TableRow>
        </>
      )}
      <TableRow
        sx={{
          opacity: isLoading ? 0.3 : 1.0,
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
        <EnhancedTableCell padding="none" align="right">
          {expand && (
            <Button
              variant="text"
              sx={{ fontSize: 'inherit' }}
              endIcon={<Eye />}
              onClick={() => setOpen(true)}
            >
              See Tokens
            </Button>
          )}
        </EnhancedTableCell>
      </TableRow>
      <TableRow>
        <EnhancedTableCell colSpan={2} padding="none" />
      </TableRow>
      <DetailsDrawer asset={row} open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export const TabletRow: FC<RowProps> = (props) => {
  const { isLoading, ...row } = props;

  const [expanded, setExpanded] = useState(false);

  const { data, isLoading: loading } = useSWR<ApiAssetResponse>(
    expanded ? `/v1/assets/detail/${row.id}` : null,
    fetcher,
  );

  const open = expanded && data && !loading;

  return (
    <>
      <TableRow
        className="divider"
        sx={{
          opacity: isLoading ? 0.3 : 1.0,
          '& > td': { border: 0 },
        }}
      >
        <EnhancedTableCell align="left">
          <Stack alignItems="center" direction="row" gap={1}>
            <SvgIcon fontSize="small">
              <SquareShape />
            </SvgIcon>
            <span>{row.name}</span>
            <Link href={'TODO'} target="_blank">
              <SvgIcon fontSize="small" sx={{ display: 'block' }}>
                <OpenInNew />
              </SvgIcon>
            </Link>
          </Stack>
        </EnhancedTableCell>
        <EnhancedTableCell align="center">
          <Stack alignItems="center" direction="row" gap={1}>
            <SvgIcon fontSize="small">
              <SquareShape />
            </SvgIcon>
            <span>{row.chain}</span>
          </Stack>
        </EnhancedTableCell>
        <EnhancedTableCell align="center">
          {getDecimalString(row.locked, row.decimal)}
        </EnhancedTableCell>
        <EnhancedTableCell align="center">
          {getDecimalString(row.locked, row.decimal)}
        </EnhancedTableCell>
        <EnhancedTableCell align="center">
          <Stack alignItems="center" direction="row" gap={1}>
            <span>HOT</span>
            <Link href={'TODO'} target="_blank">
              <SvgIcon fontSize="small" sx={{ display: 'block' }}>
                <OpenInNew />
              </SvgIcon>
            </Link>
          </Stack>
        </EnhancedTableCell>
        <EnhancedTableCell align="center">
          <Stack alignItems="center" direction="row" gap={1}>
            <span>COLD</span>
            <Link href={'TODO'} target="_blank">
              <SvgIcon fontSize="small" sx={{ display: 'block' }}>
                <OpenInNew />
              </SvgIcon>
            </Link>
          </Stack>
        </EnhancedTableCell>
        <EnhancedTableCell align="center">
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
          opacity: isLoading ? 0.3 : 1.0,
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
                      {data.bridged.map((item) => (
                        <TableRow
                          key={item.chain}
                          sx={{ '&:last-child td': { border: 0 } }}
                        >
                          <TableCell>
                            <Stack alignItems="center" direction="row" gap={1}>
                              <SvgIcon fontSize="small">
                                <SquareShape />
                              </SvgIcon>
                              <span>{item.chain}</span>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            {getDecimalString(item.amount, row.decimal)}
                          </TableCell>
                          <TableCell>
                            <Stack alignItems="center" direction="row" gap={1}>
                              <span>ID</span>
                              <Link href={'TODO'} target="_blank">
                                <SvgIcon
                                  fontSize="small"
                                  sx={{ display: 'block' }}
                                >
                                  <OpenInNew />
                                </SvgIcon>
                              </Link>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
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
