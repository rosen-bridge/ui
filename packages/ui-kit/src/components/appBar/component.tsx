import { ReactNode } from 'react';

import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

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
export const AppBar = (props: AppBarProps) => {
  const { actions, links, logo, ...rest } = useConfig('AppBar', props);

  return (
    <div {...rest}>
      {logo}
      {links}
      {actions}
    </div>
  );
};

AppBar.displayName = 'AppBar';
