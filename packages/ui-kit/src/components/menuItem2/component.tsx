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
};

export type MenuItemBaseProps = ElementBaseProps<'div', MenuItemOwnProps>;

export type MenuItem2Props = OverridableType<
  MenuItemBaseProps,
  MenuItemOverrides,
  never
>;

export const MenuItem2 = (props: MenuItem2Props) => {
  const { children, closeOnClick, ...rest } = useConfig('MenuItem2', props);
  return (
    <MenuBaseUI.Item closeOnClick={closeOnClick} {...rest}>
      {children}
    </MenuBaseUI.Item>
  );
};

MenuItem2.displayName = 'MenuItem2';
