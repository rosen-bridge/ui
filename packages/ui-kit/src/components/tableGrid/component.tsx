import { ComponentProps } from 'react';

import { ElementBaseProps, Root, Wrap } from '@/core';
import { OverridableType } from '@/types';

import './styles.scss';

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
