import type { RefObject } from 'react';

import { Popover as PopoverBaseUI } from '@base-ui/react/popover';

import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

export interface PopoverBodyOverrides {}

export type PopoverBodyOwnProps = {
  /**
   * An element to position the popup against. By default, the popup will be positioned against the trigger.
   */
  anchor?: RefObject<HTMLElement | null>;
  /**
   * Which side of the anchor element to align the popup against. May automatically change to avoid collisions.
   */
  placement?:
    | 'top-start'
    | 'bottom-start'
    | 'top-end'
    | 'bottom-end'
    | 'bottom-center'
    | 'top-center';
  /**
   * Offsets for the popup. First value is alignOffset, second is sideOffset.
   */
  offset?: [alignOffset: number, sideOffset: number];
};

export type PopoverBodyBaseProps = ElementBaseProps<'div', PopoverBodyOwnProps>;

export type PopoverBodyProps = OverridableType<PopoverBodyBaseProps, PopoverBodyOverrides, never>;

const parsePlacement = (placement?: PopoverBodyOwnProps['placement']) => {
  if (!placement) {
    return { side: undefined, align: undefined };
  }
  const [side, align] = placement.split('-');
  return {
    side: side as 'top' | 'bottom',
    align: (align ?? 'center') as 'start' | 'center' | 'end',
  };
};

export const PopoverBody = (props: PopoverBodyProps) => {
  const { anchor, children, offset, placement, ...rest } = useConfig('PopoverBody', props);

  const { side, align } = parsePlacement(placement);
  const [alignOffset, sideOffset] = offset ?? [];

  return (
    <PopoverBaseUI.Portal>
      <PopoverBaseUI.Positioner
        anchor={anchor}
        align={align}
        alignOffset={alignOffset}
        className="RosenPopoverBody-positioner"
        side={side}
        sideOffset={sideOffset}
      >
        <PopoverBaseUI.Popup {...rest}>{children}</PopoverBaseUI.Popup>
      </PopoverBaseUI.Positioner>
    </PopoverBaseUI.Portal>
  );
};

PopoverBody.displayName = 'PopoverBody';
