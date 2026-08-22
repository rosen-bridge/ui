import { Drawer as DrawerBaseUI } from '@base-ui/react/drawer';

import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

export interface DrawerOverrides {}

export type DrawerOwnProps = {
  open?: boolean;
  onClose?: () => void;
  handle?: DrawerBaseUI.Handle<unknown>;
  placement?: 'top' | 'bottom' | 'right' | 'left';
};

export type DrawerBaseProps = ElementBaseProps<'div', DrawerOwnProps>;

export type DrawerProps = OverridableType<DrawerBaseProps, DrawerOverrides, never>;

const PLACEMENT_MAP: Record<string, 'up' | 'down' | 'left' | 'right'> = {
  top: 'up',
  bottom: 'down',
  left: 'left',
  right: 'right',
};

export const Drawer = (props: DrawerProps) => {
  const { open, handle, onClose, placement = 'down', ...rest } = useConfig('Drawer', props);

  const direction = PLACEMENT_MAP[placement];

  return (
    <DrawerBaseUI.Root
      swipeDirection={direction}
      open={open}
      handle={handle}
      onOpenChange={(open) => !open && onClose?.()}
      {...rest}
    />
  );
};

Drawer.displayName = 'Drawer';
