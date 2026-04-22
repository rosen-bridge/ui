import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TableGridOverrides {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type TableGridOwnProps = {};

export type TableGridBaseProps = ElementBaseProps<'div', TableGridOwnProps>;

export type TableGridProps = OverridableType<
  TableGridBaseProps,
  TableGridOverrides,
  never
>;

export const TableGrid = (props: TableGridProps) => {
  const { ...rest } = useConfig('TableGrid', props);

  return <div {...rest} />;
};

TableGrid.displayName = 'TableGrid';
