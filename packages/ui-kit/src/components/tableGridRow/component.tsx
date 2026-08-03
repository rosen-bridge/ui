import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

export interface TableGridRowOverrides {}

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

export const TableGridRow = (props: TableGridRowProps) => {
  const { ...rest } = useConfig('TableGridRow', props);

  return <div {...rest} />;
};

TableGridRow.displayName = 'TableGridRow';
