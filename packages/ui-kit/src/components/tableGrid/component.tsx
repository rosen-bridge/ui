import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
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
