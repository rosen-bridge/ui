import { ReactNode } from 'react';

import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType } from '@/types';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AppBarOverrides {}

export type AppBarOwnProps = {
  actions?: ReactNode;
  links?: ReactNode;
  logo?: ReactNode;
};

export type AppBarBaseProps = ElementBaseProps<'div', AppBarOwnProps>;

export type AppBarProps = OverridableType<
  AppBarBaseProps,
  AppBarOverrides,
  never
>;

/**
 * renders a appBar wrapper
 * this component set the appBar size and orientation in different screen sizes
 */
export const AppBarBase = ({ actions, links, logo, ...rest }: AppBarProps) => {
  return (
    <div {...rest}>
      {logo}
      {links}
      {actions}
    </div>
  );
};

AppBarBase.displayName = 'AppBar';

export const AppBar = Wrap(AppBarBase);
