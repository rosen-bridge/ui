import { styled } from '../../../styling';
import { forwardRef, HTMLAttributes } from 'react';
import { InjectOverrides } from '../InjectOverrides';
import { useTableGrid } from './useTableGrid';

const TableGridBodyColRoot = styled('div')(({ theme }) => ({
  alignSelf: 'center',
  minWidth: 0,
  color: theme.palette.text.primary,
  fontSize: '0.875rem',
  fontWeight: 400,
  lineHeight: '1.5rem',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  'padding': theme.spacing(0, 1.5),
  '&:first-of-type': {
    paddingLeft: theme.spacing(2),
  },
  '&:last-of-type': {
    paddingRight: theme.spacing(2),
  },

}));

export type TableGridBodyColProps = HTMLAttributes<HTMLDivElement> & {
  index?: number;
};

const TableGridBodyColBase = forwardRef<HTMLDivElement, TableGridBodyColProps>((props, ref) => {
  const { children, index, ...rest } = props;

  const { available } = useTableGrid();

  if (!available(index ?? -1)) return null

  return (
    <TableGridBodyColRoot {...rest} ref={ref}>
      {children}
    </TableGridBodyColRoot>
  );
});

export const TableGridBodyCol = InjectOverrides(TableGridBodyColBase);
