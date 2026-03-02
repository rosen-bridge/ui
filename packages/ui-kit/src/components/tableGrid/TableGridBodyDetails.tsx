import { ComponentProps } from 'react';
import { ElementBaseProps, Root, Wrap } from '../../core';
import { Collapse } from '../base';
import { OverridableType } from '../../@types';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TableGridBodyDetailsOverrides {}

export type TableGridBodyDetailsOwnProps = { 
  expanded?: boolean;
};

export type TableGridBodyDetailsBaseProps = ElementBaseProps<'div', TableGridBodyDetailsOwnProps>;

export type TableGridBodyDetailsOverriddenProps = OverridableType<
  TableGridBodyDetailsBaseProps,
  TableGridBodyDetailsOverrides,
  never
>;

export const TableGridBodyDetailsBase = ({ children, expanded, ...rest }: TableGridBodyDetailsOverriddenProps) => {
  return (
    <Root {...rest}>
      <Collapse in={expanded}>
        {children}
      </Collapse>
    </Root>
  )
};

TableGridBodyDetailsBase.displayName = 'TableGridBodyDetails';

export const TableGridBodyDetails = Wrap(TableGridBodyDetailsBase);

export type TableGridBodyDetailsProps = ComponentProps<typeof TableGridBodyDetails>;
