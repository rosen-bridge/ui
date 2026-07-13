import { Menu as MenuBaseUI } from '@base-ui/react/menu';

import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

export interface MenuGroupLabelOverrides {}

export type MenuGroupLabelOwnProps = {};

export type MenuGroupLabelBaseProps = ElementBaseProps<
  'div',
  MenuGroupLabelOwnProps
>;

export type MenuGroupLabelProps = OverridableType<
  MenuGroupLabelBaseProps,
  MenuGroupLabelOverrides,
  never
>;

export const MenuGroupLabel = (props: MenuGroupLabelProps) => {
  const { ...rest } = useConfig('MenuGroupLabel', props);

  return <MenuBaseUI.GroupLabel {...rest} />;
};

MenuGroupLabel.displayName = 'MenuGroupLabel';
