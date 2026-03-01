import { ComponentProps } from 'react';
import { ElementPropsBase, Root, Wrap } from '../../core'; 

export type TableGridRowPropsBase = ElementPropsBase<'div'>;

export const TableGridRowBase = ({ ...rest }: TableGridRowPropsBase) => {
  return <Root {...rest} />;
};

TableGridRowBase.displayName = 'TableGridRow';

export const TableGridRow = Wrap(TableGridRowBase);

export type TableGridRowProps = ComponentProps<typeof TableGridRow>;
