import { Menu as MenuBaseUI } from '@base-ui/react/menu';

import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface MenuGroupOverrides {}

export type MenuGroupOwnProps = {
  /**
   * Label Group
   */
  label?: string;
};

export type MenuGroupBaseProps = ElementBaseProps<'div', MenuGroupOwnProps>;

export type MenuGroupProps = OverridableType<
  MenuGroupBaseProps,
  MenuGroupOverrides,
  never
>;

export const MenuGroup = (props: MenuGroupProps) => {
  const { children, label, ...rest } = useConfig('Menu', props);

  return (
    <MenuBaseUI.Group {...rest}>
      {label && <MenuBaseUI.GroupLabel>{label}</MenuBaseUI.GroupLabel>}
      {children}
    </MenuBaseUI.Group>
  );
};

MenuGroup.displayName = 'Menu';
