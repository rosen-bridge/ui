import { AngleDown, AngleUp, Eye } from '@rosen-bridge/icons';
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
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@rosen-bridge/ui-kit';
import { useState, FC, useMemo, useEffect } from 'react';
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
      width: 150,
      align: 'left' as const,
    },
  },
  {
    title: 'Id',
    cellProps: {
      width: 300,
      align: 'left' as const,
    },
  },
  {
    title: 'Type',
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
        <EnhancedTableCell align="left">{row.name}</EnhancedTableCell>
        <EnhancedTableCell align="left">
          <Id id={row.id} />
        </EnhancedTableCell>
        <EnhancedTableCell align="center">{row.chain}</EnhancedTableCell>
        <EnhancedTableCell align="center">
          {getDecimalString(row.locked, row.decimal)}
        </EnhancedTableCell>
        <EnhancedTableCell align="center">
          {getDecimalString(row.bridged, row.decimal)}
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
            <Box sx={{ m: 2 }}>
              {data && (
                <Grid container spacing={4}>
                  <Grid item laptop={6}>
                    <Typography variant="body2">Locked</Typography>
                    {data.locked && (
                      <Table size="small">
                        <TableBody>
                          {data.locked.map((item) => (
                            <TableRow
                              key={item.address}
                              sx={{ '&:last-child td': { border: 0 } }}
                            >
                              <TableCell>
                                <Avatar>T</Avatar>
                              </TableCell>
                              <TableCell>
                                <Id id={item.address} indicator="middle" />
                              </TableCell>
                              <TableCell>
                                {getDecimalString(item.amount, row.decimal)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </Grid>
                  <Grid item laptop={6}>
                    <Typography variant="body2">Bridged</Typography>
                    {data.bridged && (
                      <Table size="small">
                        <TableBody>
                          {data.bridged.map((item) => (
                            <TableRow
                              key={item.chain}
                              sx={{ '&:last-child td': { border: 0 } }}
                            >
                              <TableCell>
                                <Avatar>T</Avatar>
                              </TableCell>
                              <TableCell>{item.chain}</TableCell>
                              <TableCell>
                                {getDecimalString(item.amount, row.decimal)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </Grid>
                </Grid>
              )}
            </Box>
          </Collapse>
        </EnhancedTableCell>
      </TableRow>
    </>
  );
};
