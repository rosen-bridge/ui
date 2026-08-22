import { useRef } from 'react';

import { Drawer as DrawerBaseUI } from '@base-ui/react/drawer';

export const useDrawer = () => {
  const handleRef = useRef<DrawerBaseUI.Handle<unknown>>(undefined);
  if (!handleRef.current) {
    handleRef.current = DrawerBaseUI.createHandle();
  }
  const handle = handleRef.current;
  const isOpen = handle.store.useState('open');

  return {
    close: handle.close,
    isOpen,
    open: handle.open,
  };
};
