import {
  Children,
  cloneElement,
  forwardRef,
  HTMLAttributes,
  ReactElement,
  useMemo,
} from 'react';

import { styled } from '../../../styling';
import { InjectOverrides } from '../InjectOverrides';
import { TableGridBodyColProps } from './TableGridBodyCol';

const TableGridBodyRowRoot = styled('div')(({ theme }) => ({
  gridColumn: '1 / -1',
  display: 'grid',
  gridTemplateColumns: 'subgrid',
  padding: theme.spacing(1, 0),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
}));

export type TableGridBodyRowProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactElement<TableGridBodyColProps>[];
};

const TableGridBodyRowBase = forwardRef<HTMLDivElement, TableGridBodyRowProps>(
  (props, ref) => {
    const { children, ...rest } = props;

    const newChildren = useMemo(() => {
      return Children.map(children, (child, index) =>
        cloneElement(child, { index }),
      );
    }, [children]);

    return (
      <TableGridBodyRowRoot {...rest} ref={ref}>
        {newChildren}
      </TableGridBodyRowRoot>
    );
  },
);

TableGridBodyRowBase.displayName = 'TableGridBodyRow';

export const TableGridBodyRow = InjectOverrides(TableGridBodyRowBase);
