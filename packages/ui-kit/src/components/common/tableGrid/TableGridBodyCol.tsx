import { HTMLAttributes, useContext } from 'react';

import { styled } from '../../../styling';
import { TableGridContext } from './TableGridContext';

export interface TableGridBodyColProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'normal' | 'actions';
  index?: number;
}

const TableGridBodyColRoot = styled('div', {
  shouldForwardProp: (prop) => prop !== 'padding',
})<TableGridBodyColProps>(({ theme, padding = 'normal' }) => ({
  alignSelf: 'center',
  minWidth: 0,
  color: theme.palette.text.primary,
  fontSize: '0.875rem',
  fontWeight: 400,
  lineHeight: '1.5rem',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  ...(padding === 'normal' && {
    'padding': theme.spacing(0, 1.5),
    '&:first-of-type': {
      paddingLeft: theme.spacing(2),
    },
    '&:last-of-type': {
      paddingRight: theme.spacing(2),
    },
  }),
  ...(padding === 'actions' && {
    padding: theme.spacing(0, 0.5, 0, 1.5),
  }),
}));

export const TableGridBodyCol = ({
  index = -1,
  ...restProps
}: TableGridBodyColProps) => {
  const { columns } = useContext(TableGridContext);

  const display = columns[index] ?? true;

  if (display) return <TableGridBodyColRoot {...restProps} />;
  return null;
};
