import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

import { Collapsible, CollapsibleProps } from '../collapsible';
import './styles.css';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TableGridBodyDetailsOverrides {}

export type TableGridBodyDetailsOwnProps = CollapsibleProps & {};

export type TableGridBodyDetailsBaseProps = ElementBaseProps<
  typeof Collapsible,
  TableGridBodyDetailsOwnProps
>;

export type TableGridBodyDetailsProps = OverridableType<
  TableGridBodyDetailsBaseProps,
  TableGridBodyDetailsOverrides,
  never
>;

export const TableGridBodyDetails = (props: TableGridBodyDetailsProps) => {
  const { children, ...rest } = useConfig('TableGridBodyDetails', props);

  return (
    <Collapsible {...rest}>
      <div className="RosenTableGridBodyDetails-content">{children}</div>
    </Collapsible>
  );
};

TableGridBodyDetails.displayName = 'TableGridBodyDetails';
