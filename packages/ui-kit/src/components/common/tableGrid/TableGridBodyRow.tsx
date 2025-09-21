import { Children, cloneElement, HTMLAttributes, ReactElement } from 'react';

import { styled } from '../../../styling';
import { TableGridBodyColProps } from './TableGridBodyCol';

interface TableGridBodyRowProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactElement<TableGridBodyColProps>[];
}

const TableGridBodyRowRoot = styled('div')(({ theme }) => ({
  gridColumn: '1 / -1',
  display: 'grid',
  gridTemplateColumns: 'subgrid',
  padding: theme.spacing(1, 0),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
}));

export const TableGridBodyRow = ({
  children,
  ...restProps
}: TableGridBodyRowProps) => {
  return (
    <TableGridBodyRowRoot {...restProps}>
      {Children.map(children, (child, index) => {
        return cloneElement(child, { key: index, index });
      })}
    </TableGridBodyRowRoot>
  );
};
