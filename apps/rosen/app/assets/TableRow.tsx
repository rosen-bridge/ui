import { upperFirst } from 'lodash-es';
import moment from 'moment';
import { useState, FC, useMemo } from 'react';

import {
  Button,
  EnhancedTableCell,
  TableRow,
  Link,
  Typography,
  Id,
} from '@rosen-bridge/ui-kit';

import { AngleDown, AngleUp } from '@rosen-bridge/icons';

import { getDecimalString, getTxURL } from '@rosen-ui/utils';

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
];

const statusMap = {
  fraud: 'fraud',
  processing: 'processing',
  successful: 'done',
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

  return <></>;
};

export const TabletRow: FC<RowProps> = (props) => {
  const { isLoading, ...row } = props;
  return (
    <TableRow className="divider" sx={isLoading ? { opacity: 0.3 } : {}}>
      <EnhancedTableCell align="center">{row.name}</EnhancedTableCell>
      <EnhancedTableCell align="left">
        <Id id={row.id} />
      </EnhancedTableCell>
      <EnhancedTableCell align="center">{row.chain}</EnhancedTableCell>
      <EnhancedTableCell align="center">{row.locked}</EnhancedTableCell>
      <EnhancedTableCell align="center">{row.bridged}</EnhancedTableCell>
    </TableRow>
  );
};
