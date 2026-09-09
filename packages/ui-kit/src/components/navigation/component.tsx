import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

export interface NavigationOverrides {}

export type NavigationOwnProps = {};

export type NavigationBaseProps = ElementBaseProps<'div', NavigationOwnProps>;

export type NavigationProps = OverridableType<NavigationBaseProps, NavigationOverrides, never>;

export const Navigation = (props: NavigationProps) => {
  const { ...rest } = useConfig('Navigation', props);

  return <div {...rest} />;
};

Navigation.displayName = 'Navigation';
