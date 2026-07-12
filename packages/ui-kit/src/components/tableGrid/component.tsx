import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

export interface TableGridOverrides {}

export type TableGridOwnProps = {
  variant?: 'separated' | 'standard';
};

export type TableGridBaseProps = ElementBaseProps<'div', TableGridOwnProps>;

export type TableGridProps = OverridableType<
  TableGridBaseProps,
  TableGridOverrides,
  never
>;

export const TableGrid = (props: TableGridProps) => {
  const { variant = 'standard', ...rest } = useConfig('TableGrid', props);

  return <div data-variant={variant} {...rest} />;
};

TableGrid.displayName = 'TableGrid';
