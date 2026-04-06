import { ComponentProps, ComponentPropsWithRef, ElementType } from 'react';

import { ElementBaseProps, Wrap } from '@/core';
import { ColorOverridden, OverridableType } from '@/types';

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
  as: Component = 'a',
  color,
  underline = 'always',
  ...rest
}: LinkOverriddenProps) => {
  return <Component data-color={color} data-underline={underline} {...rest} />;
};

LinkBase.displayName = 'Link';

export const Link = Wrap(LinkBase);

export type LinkProps = ComponentProps<typeof Link>;
