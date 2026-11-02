import { useRef } from 'react';

import { Popover as PopoverBaseUI } from '@base-ui/react/popover';

import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

export interface PopoverOverrides {}

export type PopoverOwnProps = {
  /**
   * Handle for controlling or accessing the popover instance.
   */
  handle?: PopoverBaseUI.Handle<unknown>;
  /**
   * Controls whether the popover is open.
   */
  open?: boolean;
  /**
   * Called when the popover open state changes.
   */
  onOpenChange?: (open: boolean) => void;
};

export type PopoverBaseProps = ElementBaseProps<'div', PopoverOwnProps>;

export type PopoverProps = OverridableType<PopoverBaseProps, PopoverOverrides, never>;

let close: (() => void) | undefined;

export const Popover = (props: PopoverProps) => {
  const { onOpenChange, ...rest } = useConfig('Popover', props);

  const actionsRef = useRef<PopoverBaseUI.Root.Actions>(null);

  return (
    <PopoverBaseUI.Root
      {...rest}
      actionsRef={actionsRef}
      onOpenChange={(open) => {
        if (open) {
          close?.();
          close = actionsRef.current?.close;
        } else {
          close = undefined;
        }

        onOpenChange?.(open);
      }}
    />
  );
};

Popover.displayName = 'Popover';
