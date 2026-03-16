import { ComponentProps } from 'react';

import { OverridableType } from '@/@types';
import { Collapsible, CollapsibleOverriddenProps } from '@/components';
import { ElementBaseProps, Root, Wrap } from '@/core';

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
    <Root as={Collapsible} {...rest}>
      <div className="rosen-TableGridBodyDetails__content">{children}</div>
    </Root>
  );
};

TableGridBodyDetailsBase.displayName = 'TableGridBodyDetails';

export const TableGridBodyDetails = Wrap(TableGridBodyDetailsBase);

export type TableGridBodyDetailsProps = ComponentProps<
  typeof TableGridBodyDetails
>;
