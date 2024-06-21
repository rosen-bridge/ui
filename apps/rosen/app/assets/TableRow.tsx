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
import { useState, FC, useMemo } from 'react';
import useSWRMutation from 'swr/mutation';

import { ApiAssetResponse, Assets } from '@/_types/api';

import { DetailsDrawer } from './DetailsDrawer';

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
            <EnhancedTableCell>{row.locked}</EnhancedTableCell>
          </TableRow>
          <TableRow sx={rowStyles}>
            <EnhancedTableCell sx={{ opacity: '0.6' }}>
              Bridged
            </EnhancedTableCell>
            <EnhancedTableCell>{row.locked}</EnhancedTableCell>
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

  const [detail, setDetail] = useState<ApiAssetResponse>();

  const [expanded, setExpanded] = useState(false);

  const [loading, setLoading] = useState(false);

  const { trigger } = useSWRMutation(`/api/v1/assets/detail/${row.id}`, (url) =>
    fetch(url, { method: 'GET' }).then((res) => res.json()),
  );

  const handleExpandClick = () => {
    if (expanded) return setExpanded(false);

    if (detail) return setExpanded(true);

    setLoading(true);

    trigger()
      .then((response) => {
        setDetail(response);
        setExpanded(true);
      })
      .catch(() => {
        setExpanded(false);
      })
      .finally(() => {
        setLoading(false);
      });
  };

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
        <EnhancedTableCell align="center">{row.locked}</EnhancedTableCell>
        <EnhancedTableCell align="center">{row.bridged}</EnhancedTableCell>
        <EnhancedTableCell align="center">
          <IconButton
            size="small"
            disabled={loading}
            sx={{
              transform: !expanded ? 'rotate(0deg)' : 'rotate(180deg)',
              marginLeft: 'auto',
              transition: (theme) => {
                return theme.transitions.create('transform', {
                  duration: theme.transitions.duration.shortest,
                });
              },
            }}
            onClick={handleExpandClick}
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
          <Collapse in={expanded} unmountOnExit>
            <Divider variant="middle" sx={{ borderBottomStyle: 'dashed' }} />
            <Box sx={{ m: 2 }}>
              {detail && (
                <Grid container spacing={4}>
                  <Grid item laptop={6}>
                    <Typography variant="body2">Locked</Typography>
                    {detail.locked && (
                      <Table size="small">
                        <TableBody>
                          {detail.locked.map((row) => (
                            <TableRow
                              key={row.address}
                              sx={{ '&:last-child td': { border: 0 } }}
                            >
                              <TableCell>
                                <Avatar>T</Avatar>
                              </TableCell>
                              <TableCell>
                                <Id id={row.address} indicator="middle" />
                              </TableCell>
                              <TableCell>{row.amount}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </Grid>
                  <Grid item laptop={6}>
                    <Typography variant="body2">Bridged</Typography>
                    {detail.bridged && (
                      <Table size="small">
                        <TableBody>
                          {detail.bridged.map((item) => (
                            <TableRow
                              key={item.chain}
                              sx={{ '&:last-child td': { border: 0 } }}
                            >
                              <TableCell>
                                <Avatar>T</Avatar>
                              </TableCell>
                              <TableCell>{item.chain}</TableCell>
                              <TableCell>{item.amount}</TableCell>
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
