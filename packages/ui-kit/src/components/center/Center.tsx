import { ComponentProps } from 'react';
import { ElementPropsBase, Root, Wrap } from '../../core'; 
 
export type CenterPropsBase = {
  inline?: boolean;
} & ElementPropsBase<'div'>;

export const CenterBase = ({ inline, ...rest }: CenterPropsBase) => {
  return <Root reflects={{ inline }} {...rest} />;
};

CenterBase.displayName = 'Center';

export const Center = Wrap(CenterBase);

export type CenterProps = ComponentProps<typeof Center>;
