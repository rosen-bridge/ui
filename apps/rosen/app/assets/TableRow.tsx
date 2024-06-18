import { AngleDown } from '@rosen-bridge/icons';
import {
  Box,
  CircularProgress,
  Collapse,
  Divider,
  EnhancedTableCell,
  IconButton,
  Id,
  TableRow,
} from '@rosen-bridge/ui-kit';
import { useState, FC, useMemo } from 'react';
import useSWRMutation from 'swr/mutation';

import { Asset } from '@/_types/api';

interface RowProps extends Asset {
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
      align: 'center' as const,
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

  const rowStyles = useMemo(
    () => (isLoading ? { opacity: 0.3 } : {}),
    [isLoading],
  );

  const toggleExpand = () => {
    setExpand((prevState) => !prevState);
  };

  return <></>;
};

export const TabletRow: FC<RowProps> = (props) => {
  const { isLoading, ...row } = props;

  const [detail, setDetail] = useState<any>();

  const [expanded, setExpanded] = useState(false);

  const [loading, setLoading] = useState(false);

  // const { trigger } = useSWRMutation<any, any, any, any>(`/assets/detail/${row.id}`,);

  const handleExpandClick = () => {
    if (expanded) return setExpanded(false);
    if (detail) return setExpanded(true);
    setLoading(true);
    // trigger().then((response) => {
    //   setDetail(response)
    //   setExpanded(true);
    // })
  };

  return (
    <>
      <TableRow className="divider" sx={isLoading ? { opacity: 0.3 } : {}}>
        <EnhancedTableCell align="center">{row.name}</EnhancedTableCell>
        <EnhancedTableCell align="left">
          <Id id={row.id} />
        </EnhancedTableCell>
        <EnhancedTableCell align="center">{row.chain}</EnhancedTableCell>
        <EnhancedTableCell align="center">{row.locked}</EnhancedTableCell>
        <EnhancedTableCell align="center">{row.bridged}</EnhancedTableCell>
        <EnhancedTableCell align="center">
          <IconButton
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
              <AngleDown />
            )}
          </IconButton>
        </EnhancedTableCell>
      </TableRow>
      <TableRow sx={{ '&:last-child td': { border: 0 } }}>
        <EnhancedTableCell colSpan={10} padding="none">
          <Collapse in={expanded} unmountOnExit>
            <Divider variant="middle" sx={{ borderBottomStyle: 'dashed' }} />
            <Box sx={{ m: 2 }}>
              This Box renders as an HTML section element.
            </Box>
          </Collapse>
        </EnhancedTableCell>
      </TableRow>
    </>
  );
};
