import { ComponentProps } from 'react';
import { ElementPropsBase, Root, Wrap } from '../../core'; 

export type TableGridCellPropsBase = {
    width?: string;
} & ElementPropsBase<'div'>;

export const TableGridCellBase = ({ width, ...rest }: TableGridCellPropsBase) => {
  return <Root reflects={{ width }} {...rest} />;
};

TableGridCellBase.displayName = 'TableGridCell';

export const TableGridCell = Wrap(TableGridCellBase);

export type TableGridCellProps = ComponentProps<typeof TableGridCell>;
