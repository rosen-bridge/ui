import { ComponentProps } from 'react';

import { OverridableType, WidthOverridden } from '@/@types';
import { ElementBaseProps, Root, Wrap } from '@/core';
import { toCSSUnit } from '@/utils';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TableGridCellOverrides {}

export type TableGridCellOwnProps = {
  width?: WidthOverridden;
};

export type TableGridCellBaseProps = ElementBaseProps<
  'div',
  TableGridCellOwnProps
>;

export type TableGridCellOverriddenProps = OverridableType<
  TableGridCellBaseProps,
  TableGridCellOverrides,
  'width'
>;

export const TableGridCellBase = ({
  width,
  ...rest
}: TableGridCellOverriddenProps) => {
  const styles = {
    width: toCSSUnit('width', width),
  };
  return <Root styles={styles} {...rest} />;
};

TableGridCellBase.displayName = 'TableGridCell';

export const TableGridCell = Wrap(TableGridCellBase);

export type TableGridCellProps = ComponentProps<typeof TableGridCell>;
