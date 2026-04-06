import { ComponentProps } from 'react';

import { Collapsible, CollapsibleOverriddenProps } from '@/components';
import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType } from '@/types';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TableGridBodyDetailsOverrides {}

export type TableGridBodyDetailsOwnProps = CollapsibleOverriddenProps & {};

export type TableGridBodyDetailsBaseProps = ElementBaseProps<
  typeof Collapsible,
  TableGridBodyDetailsOwnProps
>;

export type TableGridBodyDetailsOverriddenProps = OverridableType<
  TableGridBodyDetailsBaseProps,
  TableGridBodyDetailsOverrides,
  never
>;

export const TableGridBodyDetailsBase = ({
  children,
  ...rest
}: TableGridBodyDetailsOverriddenProps) => {
  return (
    <Collapsible {...rest}>
      <div className="RosenTableGridBodyDetails-content">{children}</div>
    </Collapsible>
  );
};

TableGridBodyDetailsBase.displayName = 'TableGridBodyDetails';

export const TableGridBodyDetails = Wrap(TableGridBodyDetailsBase);

export type TableGridBodyDetailsProps = ComponentProps<
  typeof TableGridBodyDetails
>;
