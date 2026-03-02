import { ComponentProps } from 'react';
import { ElementBaseProps, Root, Wrap } from '../../core'; 
import { OverridableType } from '../../@types';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TableGridRowOverrides {}

export type TableGridRowOwnProps = { };

export type TableGridRowBaseProps = ElementBaseProps<'div', TableGridRowOwnProps>;

export type TableGridRowOverriddenProps = OverridableType<
  TableGridRowBaseProps,
  TableGridRowOverrides,
  never
>;

export const TableGridRowBase = ({ ...rest }: TableGridRowOverriddenProps) => {
  return <Root {...rest} />;
};

TableGridRowBase.displayName = 'TableGridRow';

export const TableGridRow = Wrap(TableGridRowBase);

export type TableGridRowProps = ComponentProps<typeof TableGridRow>;
