import { ElementType } from 'react';

import { Menu as MenuBaseUI } from '@base-ui/react/menu';

import { Icon, IconProps } from '@/components';
import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface MenuTriggerOverrides {}

export type MenuTriggerOwnProps<T extends ElementType = 'button'> = {
  /** Custom element or component to render as. */
  as?: T;
  /** Handle to associate the trigger with a menu. */
  handle?: MenuBaseUI.Handle<unknown>;
  /** Name of the icon to render after children. */
  iconName?: IconProps['name'];
  /** Whether the menu should open on hover. */
  openOnHover?: boolean;
};

export type MenuTriggerBaseProps<T extends ElementType = 'button'> =
  ElementBaseProps<T, MenuTriggerOwnProps<T>>;

export type MenuTriggerProps<T extends ElementType = 'button'> =
  OverridableType<MenuTriggerBaseProps<T>, MenuTriggerOverrides, never>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TriggerProps = Record<string, any>;

export const MenuTrigger = <T extends ElementType = 'button'>(
  props: MenuTriggerProps<T>,
) => {
  const {
    as: Component = 'button',
    children,
    handle,
    iconName,
    openOnHover,
    ...rest
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useConfig('MenuTrigger', props as any);

  const isNativeButton =
    Component === 'button' ||
    (typeof Component === 'function' &&
      Component.name?.toLowerCase().includes('button'));
  return (
    <MenuBaseUI.Trigger
      nativeButton={isNativeButton}
      handle={handle}
      openOnHover={openOnHover}
      render={(triggerProps: TriggerProps) => (
        <Component {...triggerProps} {...rest}>
          {children}
          {iconName && (
            <span
              className="RosenMenuTrigger-icon"
              data-popup-open={triggerProps['data-popup-open']}
            >
              <Icon name={iconName} />
            </span>
          )}
        </Component>
      )}
    />
  );
};

MenuTrigger.displayName = 'MenuTrigger';
