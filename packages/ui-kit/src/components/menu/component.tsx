import { Menu as MenuBaseUI } from '@base-ui/react/menu';

import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface MenuOverrides {}

export type MenuOwnProps = {
  /**
   * Handle for controlling or accessing the menu instance.
   */
  handle?: MenuBaseUI.Handle<unknown>;
  /**
   * Controls whether the menu is open.
   */
  open?: boolean;
  /**
   * Called when the menu open state changes.
   */
  onOpenChange?: (open: boolean) => void;
};

export type MenuBaseProps = ElementBaseProps<'div', MenuOwnProps>;

export type MenuProps = OverridableType<MenuBaseProps, MenuOverrides, never>;

export const Menu = (props: MenuProps) => {
  const { ...rest } = useConfig('Menu', props);

  return <MenuBaseUI.Root {...rest} />;
};

Menu.displayName = 'Menu';
