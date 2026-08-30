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

export const Popover = (props: PopoverProps) => {
  const { ...rest } = useConfig('Popover', props);

  return <PopoverBaseUI.Root {...rest} />;
};

Popover.displayName = 'Popover';
