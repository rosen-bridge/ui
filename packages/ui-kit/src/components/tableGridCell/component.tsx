import { useMemo } from 'react';

import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType, Width } from '@/types';
import { toCSSUnit } from '@/utils';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TableGridCellOverrides {}

export type TableGridCellOwnProps = {
  width?: Width;
};

export type TableGridCellBaseProps = ElementBaseProps<
  'div',
  TableGridCellOwnProps
>;

export type TableGridCellProps = OverridableType<
  TableGridCellBaseProps,
  TableGridCellOverrides,
  'width'
>;

export const TableGridCellBase = ({ width, ...rest }: TableGridCellProps) => {
  const size = useMemo(() => toCSSUnit('width', width), [width]);
  return <div data-width={size} {...rest} />;
};

TableGridCellBase.displayName = 'TableGridCell';

export const TableGridCell = Wrap(TableGridCellBase);
