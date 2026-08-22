import { Drawer as DrawerBaseUI } from '@base-ui/react/drawer';

import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

export interface DrawerBodyOverrides {}

export type DrawerBodyOwnProps = {};

export type DrawerBodyBaseProps = ElementBaseProps<'div', DrawerBodyOwnProps>;

export type DrawerBodyProps = OverridableType<DrawerBodyBaseProps, DrawerBodyOverrides, never>;

export const DrawerBody = (props: DrawerBodyProps) => {
  const { children, ...rest } = useConfig('DrawerBody', props);

  return (
    <DrawerBaseUI.Portal>
      <DrawerBaseUI.Backdrop className="RosenDrawerBody-backdrop" />
      <DrawerBaseUI.Viewport className="RosenDrawerBody-viewport">
        <DrawerBaseUI.Popup {...rest}>
          <DrawerBaseUI.Content className="RosenDrawerBody-child">{children}</DrawerBaseUI.Content>
        </DrawerBaseUI.Popup>
      </DrawerBaseUI.Viewport>
    </DrawerBaseUI.Portal>
  );
};

DrawerBody.displayName = 'DrawerBody';
