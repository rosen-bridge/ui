import type { ElementType } from 'react';

import { Menu as MenuBaseUI } from '@base-ui/react/menu';

import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

export interface MenuTriggerOverrides {}

export type MenuTriggerOwnProps<T extends ElementType = 'button'> = {
  /**
   * Custom element or component to render as.
   */
  as?: T;
  /**
   * Handle to associate the trigger with a menu.
   */
  handle?: MenuBaseUI.Handle<unknown>;
  /**
   * Whether the menu should open on hover.
   */
  openOnHover?: boolean;
};

export type MenuTriggerBaseProps<T extends ElementType = 'button'> =
  ElementBaseProps<T, MenuTriggerOwnProps<T>>;

export type MenuTriggerProps<T extends ElementType = 'button'> =
  OverridableType<MenuTriggerBaseProps<T>, MenuTriggerOverrides, never>;

export const MenuTrigger = <T extends ElementType = 'button'>(
  props: MenuTriggerProps<T>,
) => {
  const {
    as: Component = 'button',
    handle,
    openOnHover,
    ...rest
    // biome-ignore lint/suspicious/noExplicitAny: Use a better type
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
      render={(triggerProps) => <Component {...triggerProps} {...rest} />}
    />
  );
};

MenuTrigger.displayName = 'MenuTrigger';
