import { ComponentProps } from 'react';
import { ElementBaseProps, Root, Wrap } from '../../core';
import { Collapse } from '../base';
import { OverridableType } from '../../@types';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TableGridBodyDetailsOverrides {}

export type TableGridBodyDetailsOwnProps = {};

export type TableGridBodyDetailsBaseProps = ElementBaseProps<typeof Collapse, TableGridBodyDetailsOwnProps>;

export type TableGridBodyDetailsOverriddenProps = OverridableType<
  TableGridBodyDetailsBaseProps,
  TableGridBodyDetailsOverrides,
  never
>;

export const TableGridBodyDetailsBase = ({ ...rest }: TableGridBodyDetailsOverriddenProps) => {
  return <Root as={Collapse} {...rest} />;
};

TableGridBodyDetailsBase.displayName = 'TableGridBodyDetails';

export const TableGridBodyDetails = Wrap(TableGridBodyDetailsBase);

export type TableGridBodyDetailsProps = ComponentProps<typeof TableGridBodyDetails>;
