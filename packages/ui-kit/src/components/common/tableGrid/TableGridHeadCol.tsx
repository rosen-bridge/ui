import { HTMLAttributes, useContext, useEffect } from 'react';

import { BreakpointQuery, useBreakpoint } from '../../../hooks';
import { styled } from '../../../styling';
import { TableGridContext } from './TableGridContext';

export interface TableGridHeadColProps extends HTMLAttributes<HTMLDivElement> {
  hideOn?: BreakpointQuery;
  index?: number;
}

const TableGridHeadColRoot = styled('div')(({ theme }) => ({
  'fontSize': '0.75rem',
  'fontWeight': 600,
  'lineHeight': '1.5rem',
  'color': theme.palette.text.secondary,
  'textTransform': 'uppercase',
  'overflow': 'hidden',
  'padding': theme.spacing(0, 1.5),
  '&:first-of-type': {
    paddingLeft: theme.spacing(2),
  },
  '&:last-of-type': {
    paddingRight: theme.spacing(2),
  },
}));

export const TableGridHeadCol = ({
  hideOn,
  index,
  ...restProps
}: TableGridHeadColProps) => {
  const { setColumns } = useContext(TableGridContext);
  const hide = useBreakpoint(hideOn || 'mobile-down');

  const display = !hideOn || (hideOn && !hide);

  useEffect(() => {
    setColumns((prev) => {
      const next = [...prev];
      next[index ?? 0] = display;
      return next;
    });
  }, [display, index, setColumns]);

  if (display) return <TableGridHeadColRoot {...restProps} />;
  return null;
};
