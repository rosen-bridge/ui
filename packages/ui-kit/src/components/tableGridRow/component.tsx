import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

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

export const TableGridRow = (props: TableGridRowProps) => {
  const { ...rest } = useConfig('TableGridRow', props);

  return <div {...rest} />;
};

TableGridRow.displayName = 'TableGridRow';
