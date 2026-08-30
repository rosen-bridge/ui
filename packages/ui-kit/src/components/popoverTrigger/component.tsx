import type { ElementType } from 'react';

import { Popover as PopoverBaseUI } from '@base-ui/react/popover';

import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

export interface PopoverTriggerOverrides {}

export type PopoverTriggerOwnProps<T extends ElementType = 'button'> = {
  /**
   * Custom element or component to render as.
   */
  as?: T;
  /**
   * Handle to associate the trigger with a popover.
   */
  handle?: PopoverBaseUI.Handle<unknown>;
  /**
   * Whether the popover should open on hover.
   */
  openOnHover?: boolean;
};

export type PopoverTriggerBaseProps<T extends ElementType = 'button'> = ElementBaseProps<
  T,
  PopoverTriggerOwnProps<T>
>;

export type PopoverTriggerProps<T extends ElementType = 'button'> = OverridableType<
  PopoverTriggerBaseProps<T>,
  PopoverTriggerOverrides,
  never
>;

export const PopoverTrigger = <T extends ElementType = 'button'>(props: PopoverTriggerProps<T>) => {
  const {
    as: Component = 'button',
    handle,
    openOnHover,
    ...rest
    /**
     * TODO: remove the inline Biome comment
     * local:ergo/rosen-bridge/ui#441
     */
    // biome-ignore lint/suspicious/noExplicitAny: Use a better type
  } = useConfig('PopoverTrigger', props as any);

  const isNativeButton =
    Component === 'button' ||
    (typeof Component === 'function' && Component.name?.toLowerCase().includes('button'));

  return (
    <PopoverBaseUI.Trigger
      nativeButton={isNativeButton}
      handle={handle}
      openOnHover={openOnHover}
      render={(triggerProps) => <Component {...triggerProps} {...rest} />}
    />
  );
};

PopoverTrigger.displayName = 'PopoverTrigger';
