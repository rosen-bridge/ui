import type { ElementType } from 'react';

import { Drawer as DrawerBaseUI } from '@base-ui/react/drawer';

import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

export interface DrawerTriggerOverrides {}

export type DrawerTriggerOwnProps<T extends ElementType = 'button'> = {
  /**
   * Custom element or component to render as.
   */
  as?: T;
  handle?: DrawerBaseUI.Handle<unknown>;
};

export type DrawerTriggerBaseProps<T extends ElementType = 'button'> = ElementBaseProps<
  T,
  DrawerTriggerOwnProps<T>
>;

export type DrawerTriggerProps<T extends ElementType = 'button'> = OverridableType<
  DrawerTriggerBaseProps<T>,
  DrawerTriggerOverrides,
  never
>;

export const DrawerTrigger = <T extends ElementType = 'button'>(props: DrawerTriggerProps<T>) => {
  const {
    as: Component = 'button',
    handle,
    ...rest
    // biome-ignore lint/suspicious/noExplicitAny: Use a better type
  } = useConfig('DrawerTrigger', props as any);

  const isNativeButton =
    Component === 'button' ||
    (typeof Component === 'function' && Component.name?.toLowerCase().includes('button'));

  return (
    <DrawerBaseUI.Trigger
      nativeButton={isNativeButton}
      handle={handle}
      render={(triggerProps) => <Component {...triggerProps} {...rest} />}
    />
  );
};

DrawerTrigger.displayName = 'DrawerTrigger';
