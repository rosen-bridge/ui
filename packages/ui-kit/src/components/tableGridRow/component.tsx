import { ComponentProps } from 'react';

import { OverridableType } from '../../@types';
import { ElementBaseProps, Root, Wrap } from '../../core';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TableGridRowOverrides {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type TableGridRowOwnProps = {};

export type TableGridRowBaseProps = ElementBaseProps<
  'div',
  TableGridRowOwnProps
>;

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
