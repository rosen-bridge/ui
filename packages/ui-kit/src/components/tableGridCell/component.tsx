import { useMemo } from 'react';

import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType, Width } from '@/types';
import { toCSSUnit } from '@/utils';

import './styles.css';

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

export const TableGridCell = (props: TableGridCellProps) => {
  const { width, ...rest } = useConfig('TableGridCell', props);

  const size = useMemo(() => toCSSUnit('width', width), [width]);

  return <div data-width={size} {...rest} />;
};

TableGridCell.displayName = 'TableGridCell';
