import { ComponentProps } from 'react';
import { ElementPropsBase, Root, Wrap } from '../../core'; 

export type TableGridBodyPropsBase = ElementPropsBase<'div'>;

export const TableGridBodyBase = ({ ...rest }: TableGridBodyPropsBase) => {
  return <Root {...rest} />;
};

TableGridBodyBase.displayName = 'TableGridBody';

export const TableGridBody = Wrap(TableGridBodyBase);

export type TableGridBodyProps = ComponentProps<typeof TableGridBody>;
