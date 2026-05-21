import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

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

export const TableGridBody = (props: TableGridBodyProps) => {
  const { ...rest } = useConfig('TableGridBody', props);

  return <div {...rest} />;
};

TableGridBody.displayName = 'TableGridBody';
