import { ComponentProps } from 'react';

import { OverridableType } from '@/types';
import { ElementBaseProps, Root, Wrap } from '@/core';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TableGridBodyOverrides {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type TableGridBodyOwnProps = {};

export type TableGridBodyBaseProps = ElementBaseProps<
  'div',
  TableGridBodyOwnProps
>;

export type TableGridBodyOverriddenProps = OverridableType<
  TableGridBodyBaseProps,
  TableGridBodyOverrides,
  never
>;

export const TableGridBodyBase = ({
  ...rest
}: TableGridBodyOverriddenProps) => {
  return <Root {...rest} />;
};

TableGridBodyBase.displayName = 'TableGridBody';

export const TableGridBody = Wrap(TableGridBodyBase);

export type TableGridBodyProps = ComponentProps<typeof TableGridBody>;
