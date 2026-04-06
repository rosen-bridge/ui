import { ComponentProps } from 'react';

import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType } from '@/types';

import './styles.scss';

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
  return <div {...rest} />;
};

TableGridRowBase.displayName = 'TableGridRow';

export const TableGridRow = Wrap(TableGridRowBase);

export type TableGridRowProps = ComponentProps<typeof TableGridRow>;
