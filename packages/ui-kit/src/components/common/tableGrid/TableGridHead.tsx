import { Children, cloneElement, forwardRef, HTMLAttributes, useMemo, ReactElement } from 'react';
import { InjectOverrides } from '../InjectOverrides';
import { styled } from '../../../styling';
import { TableGridHeadColProps } from './TableGridHeadCol';

const TableGridHeadRoot = styled('div')(({ theme }) => ({
  gridColumn: '1 / -1',
  display: 'grid',
  gridTemplateColumns: 'subgrid',
  padding: theme.spacing(1, 0),
  backgroundColor: theme.palette.secondary.light,
  borderRadius: theme.shape.borderRadius,
}));

export type TableGridHeadProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactElement<TableGridHeadColProps>[];
};

const TableGridHeadBase = forwardRef<HTMLDivElement, TableGridHeadProps>((props, ref) => {
  const { children, ...rest } = props;

  const newChildren = useMemo(() => {
    return Children.map(children, (child, index) => cloneElement(child, { index }))
  }, [children]);

  return (
    <TableGridHeadRoot {...rest} ref={ref}>
      {newChildren}
    </TableGridHeadRoot>
  );
});

export const TableGridHead = InjectOverrides(TableGridHeadBase);
