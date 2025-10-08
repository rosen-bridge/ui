import { BreakpointQuery, useBreakpoint } from '../../../hooks';
import { styled } from '../../../styling';
import { useTableGrid } from './useTableGrid';
import { forwardRef, HTMLAttributes, useEffect } from 'react';
import { InjectOverrides } from '../InjectOverrides';

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

export type TableGridHeadColProps = HTMLAttributes<HTMLDivElement> & {
  hideOn?: BreakpointQuery;
  index?: number;
  width?: string;
};

const TableGridHeadColBase = forwardRef<HTMLDivElement, TableGridHeadColProps>((props, ref) => {
  const { children, hideOn, index, width, ...rest } = props;

  const hide = useBreakpoint(hideOn || 'mobile-down');

  const { register, unregister } = useTableGrid();

  const show = !hideOn || (hideOn && !hide);

  useEffect(() => {
    if (typeof index !== 'number' || !show) return;

    register(index, { width });

    return () => {
      unregister(index);
    };
  }, [index, show, width, register, unregister]);

  if (!show) return null;

  return (
    <TableGridHeadColRoot {...rest} ref={ref}>
      {children}
    </TableGridHeadColRoot>
  );
});

export const TableGridHeadCol = InjectOverrides(TableGridHeadColBase);
