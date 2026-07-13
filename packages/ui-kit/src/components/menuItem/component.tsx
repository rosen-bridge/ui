import { Menu as MenuBaseUI } from '@base-ui/react/menu';

import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface MenuItemOverrides {}

export type MenuItemOwnProps = {
  /**
   * Whether to close the menu when the item is clicked.
   */
  closeOnClick?: boolean;
  /**
   * Highlights the menu item as the active option.
   */
  selected?: boolean;
};

export type MenuItemBaseProps = ElementBaseProps<'div', MenuItemOwnProps>;

export type MenuItemProps = OverridableType<
  MenuItemBaseProps,
  MenuItemOverrides,
  never
>;

export const MenuItem = (props: MenuItemProps) => {
  const {
    closeOnClick = true,
    selected,
    ...rest
  } = useConfig('MenuItem', props);
  return (
    <MenuBaseUI.Item
      data-selected={selected}
      closeOnClick={closeOnClick}
      {...rest}
    />
  );
};

MenuItem.displayName = 'MenuItem';
