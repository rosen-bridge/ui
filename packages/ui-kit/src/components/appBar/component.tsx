import { ComponentProps, ReactNode } from 'react';

import { OverridableType } from '@/types';
import { ElementBaseProps, Root, Wrap } from '@/core';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AppBarOverrides {}

export type AppBarOwnProps = {
  actions?: ReactNode;
  links?: ReactNode;
  logo?: ReactNode;
};

export type AppBarBaseProps = ElementBaseProps<'div', AppBarOwnProps>;

export type AppBarOverriddenProps = OverridableType<
  AppBarBaseProps,
  AppBarOverrides,
  never
>;

/**
 * renders a appBar wrapper
 * this component set the appBar size and orientation in different screen sizes
 */
export const AppBarBase = ({
  actions,
  links,
  logo,
  ...rest
}: AppBarOverriddenProps) => {
  return (
    <Root {...rest}>
      {logo}
      {links}
      {actions}
    </Root>
  );
};

AppBarBase.displayName = 'AppBar';

export const AppBar = Wrap(AppBarBase);

export type AppBarProps = ComponentProps<typeof AppBar>;
