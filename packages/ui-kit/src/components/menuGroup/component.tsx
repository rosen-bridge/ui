import { Menu as MenuBaseUI } from '@base-ui/react/menu';

import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

export interface MenuGroupOverrides {}

export type MenuGroupOwnProps = {};

export type MenuGroupBaseProps = ElementBaseProps<'div', MenuGroupOwnProps>;

export type MenuGroupProps = OverridableType<
  MenuGroupBaseProps,
  MenuGroupOverrides,
  never
>;

export const MenuGroup = (props: MenuGroupProps) => {
  const { ...rest } = useConfig('MenuGroup', props);

  return <MenuBaseUI.Group {...rest} />;
};

MenuGroup.displayName = 'MenuGroup';
