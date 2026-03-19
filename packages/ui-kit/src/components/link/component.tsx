import { ComponentProps, ComponentPropsWithRef, ElementType } from 'react';

import { ColorOverridden, OverridableType } from '@/types';
import { ElementBaseProps, Root, Wrap } from '@/core';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface LinkOverrides {}

export type LinkOwnProps = {
  as?: ElementType<ComponentPropsWithRef<'a'>>;
  color?: ColorOverridden;
  underline?: 'always' | 'hover' | 'none';
};

export type LinkBaseProps = ElementBaseProps<'a', LinkOwnProps>;

export type LinkOverriddenProps = OverridableType<
  LinkBaseProps,
  LinkOverrides,
  'color' | 'href'
>;

export const LinkBase = ({
  as = 'a',
  color,
  underline = 'always',
  ...rest
}: LinkOverriddenProps) => {
  return <Root as={as} reflects={{ color, underline }} {...rest} />;
};

LinkBase.displayName = 'Link';

export const Link = Wrap(LinkBase);

export type LinkProps = ComponentProps<typeof Link>;
