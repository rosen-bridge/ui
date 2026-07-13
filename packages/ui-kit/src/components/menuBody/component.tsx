import { RefObject } from 'react';

import { Menu as MenuBaseUI } from '@base-ui/react/menu';

import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface MenuBodyOverrides {}

export type MenuBodyOwnProps = {
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

export type MenuBodyBaseProps = ElementBaseProps<'div', MenuBodyOwnProps>;

export type MenuBodyProps = OverridableType<
  MenuBodyBaseProps,
  MenuBodyOverrides,
  never
>;

const parsePlacement = (placement?: MenuBodyOwnProps['placement']) => {
  if (!placement) {
    return { side: undefined, align: undefined };
  }
  const [side, align] = placement.split('-');
  return {
    side: side as 'top' | 'bottom',
    align: (align ?? 'center') as 'start' | 'center' | 'end',
  };
};

export const MenuBody = (props: MenuBodyProps) => {
  const { anchor, children, offset, placement, ...rest } = useConfig(
    'MenuBody',
    props,
  );

  const { side, align } = parsePlacement(placement);
  const [alignOffset, sideOffset] = offset ?? [];

  return (
    <MenuBaseUI.Portal>
      <MenuBaseUI.Positioner
        anchor={anchor}
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <MenuBaseUI.Popup {...rest}>
          <MenuBaseUI.Viewport>{children}</MenuBaseUI.Viewport>
        </MenuBaseUI.Popup>
      </MenuBaseUI.Positioner>
    </MenuBaseUI.Portal>
  );
};

MenuBody.displayName = 'MenuBody';
