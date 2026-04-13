import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType } from '@/types';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TableGridBodyOverrides {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type TableGridBodyOwnProps = {};

export type TableGridBodyBaseProps = ElementBaseProps<
  'div',
  TableGridBodyOwnProps
>;

export type TableGridBodyProps = OverridableType<
  TableGridBodyBaseProps,
  TableGridBodyOverrides,
  never
>;

export const TableGridBodyBase = ({ ...rest }: TableGridBodyProps) => {
  return <div {...rest} />;
};

TableGridBodyBase.displayName = 'TableGridBody';

export const TableGridBody = Wrap(TableGridBodyBase);
