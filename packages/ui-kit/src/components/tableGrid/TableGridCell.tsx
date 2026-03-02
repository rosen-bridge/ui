import { ComponentProps } from 'react';
import { ElementBaseProps, Root, Wrap } from '../../core';
import { OverridableType } from '../../@types';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TableGridCellOverrides {}

export type TableGridCellOwnProps = { 
  width?: string;
};

export type TableGridCellBaseProps = ElementBaseProps<'div', TableGridCellOwnProps>;

export type TableGridCellOverriddenProps = OverridableType<
  TableGridCellBaseProps,
  TableGridCellOverrides,
  never
>;

export const TableGridCellBase = ({ width, ...rest }: TableGridCellOverriddenProps) => {
  return <Root reflects={{ width }} {...rest} />;
};

TableGridCellBase.displayName = 'TableGridCell';

export const TableGridCell = Wrap(TableGridCellBase);

export type TableGridCellProps = ComponentProps<typeof TableGridCell>;
