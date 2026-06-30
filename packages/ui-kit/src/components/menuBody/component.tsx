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
   * How to align the popup relative to the specified side.
   */
  align?: 'start' | 'center' | 'end';
  /**
   * Which side of the anchor element to align the popup against. May automatically change to avoid collisions.
   */
  side?: 'top' | 'bottom' | 'left' | 'right' | 'inline-end' | 'inline-start';
};

export type MenuBodyBaseProps = ElementBaseProps<'div', MenuBodyOwnProps>;

export type MenuBodyProps = OverridableType<
  MenuBodyBaseProps,
  MenuBodyOverrides,
  never
>;

export const MenuBody = (props: MenuBodyProps) => {
  const { children, anchor, side, ...rest } = useConfig('MenuBody', props);

  return (
    <MenuBaseUI.Portal {...rest}>
      <MenuBaseUI.Positioner anchor={anchor} side={side}>
        <MenuBaseUI.Popup className="RosenPopup">
          <MenuBaseUI.Viewport>{children}</MenuBaseUI.Viewport>
        </MenuBaseUI.Popup>
      </MenuBaseUI.Positioner>
    </MenuBaseUI.Portal>
  );
};

MenuBody.displayName = 'MenuBody';
