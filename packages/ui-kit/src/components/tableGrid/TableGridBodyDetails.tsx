import { ComponentProps } from 'react';
import { ElementPropsBase, Root, Wrap } from '../../core';
import { Collapse } from '../base';

export type TableGridBodyDetailsPropsBase = {
  expanded?: boolean;
} & ElementPropsBase<'div'>;

export const TableGridBodyDetailsBase = ({ children, expanded, ...rest }: TableGridBodyDetailsPropsBase) => {
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
