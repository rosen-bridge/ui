import { ComponentProps } from 'react';
import { ElementPropsBase, Root, Wrap } from '../../core'; 

export type TableGridPropsBase = ElementPropsBase<'div'>;

export const TableGridBase = ({ ...rest }: TableGridPropsBase) => {
  return <Root {...rest} />;
};

TableGridBase.displayName = 'TableGrid';

export const TableGrid = Wrap(TableGridBase);

export type TableGridProps = ComponentProps<typeof TableGrid>;
