import { Collapsible, CollapsibleProps } from '@/components';
import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType } from '@/types';

import './styles.scss';

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

export const TableGridBodyDetailsBase = ({
  children,
  ...rest
}: TableGridBodyDetailsProps) => {
  return (
    <Collapsible {...rest}>
      <div className="RosenTableGridBodyDetails-content">{children}</div>
    </Collapsible>
  );
};

TableGridBodyDetailsBase.displayName = 'TableGridBodyDetails';

export const TableGridBodyDetails = Wrap(TableGridBodyDetailsBase);
