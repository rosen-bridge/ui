import { ComponentProps } from 'react';

import { OverridableType } from '../../@types';
import { ElementBaseProps, Root, Wrap } from '../../core';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TableGridOverrides {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type TableGridOwnProps = {};

export type TableGridBaseProps = ElementBaseProps<'div', TableGridOwnProps>;

export type TableGridOverriddenProps = OverridableType<
  TableGridBaseProps,
  TableGridOverrides,
  never
>;

export const TableGridBase = ({ ...rest }: TableGridOverriddenProps) => {
  return <Root {...rest} />;
};

TableGridBase.displayName = 'TableGrid';

export const TableGrid = Wrap(TableGridBase);

export type TableGridProps = ComponentProps<typeof TableGrid>;
