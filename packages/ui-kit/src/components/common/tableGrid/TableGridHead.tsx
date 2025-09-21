import { Children, cloneElement, HTMLAttributes, ReactElement } from 'react';

import { styled } from '../../../styling';
import { TableGridHeadColProps } from './TableGridHeadCol';

interface TableGridHeadProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactElement<TableGridHeadColProps>[];
}

const TableGridHeadRoot = styled('div')(({ theme }) => ({
  gridColumn: '1 / -1',
  display: 'grid',
  gridTemplateColumns: 'subgrid',
  padding: theme.spacing(1, 0),
  backgroundColor: theme.palette.secondary.light,
  borderRadius: theme.shape.borderRadius,
}));

export const TableGridHead = ({
  children,
  ...restProps
}: TableGridHeadProps) => {
  return (
    <TableGridHeadRoot {...restProps}>
      {Children.map(children, (child, index) => {
        return cloneElement(child, { key: index, index });
      })}
    </TableGridHeadRoot>
  );
};
