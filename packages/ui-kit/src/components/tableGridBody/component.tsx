import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

export interface TableGridBodyOverrides {}

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

export const TableGridBody = (props: TableGridBodyProps) => {
  const { ...rest } = useConfig('TableGridBody', props);

  return <div {...rest} />;
};

TableGridBody.displayName = 'TableGridBody';
