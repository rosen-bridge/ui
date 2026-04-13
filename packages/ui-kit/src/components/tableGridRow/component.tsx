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

export type TableGridRowProps = OverridableType<
  TableGridRowBaseProps,
  TableGridRowOverrides,
  never
>;

export const TableGridRowBase = ({ ...rest }: TableGridRowProps) => {
  return <div {...rest} />;
};

TableGridRowBase.displayName = 'TableGridRow';

export const TableGridRow = Wrap(TableGridRowBase);
