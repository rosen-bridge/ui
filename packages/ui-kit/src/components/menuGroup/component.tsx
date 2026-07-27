import { Menu as MenuBaseUI } from '@base-ui/react/menu';

import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface MenuGroupOverrides {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
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
