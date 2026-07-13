import { useRef } from 'react';

import { Menu as MenuBaseUI } from '@base-ui/react/menu';

export const useMenu = () => {
  const handleRef = useRef<MenuBaseUI.Handle<unknown>>(undefined);
  if (!handleRef.current) {
    handleRef.current = MenuBaseUI.createHandle();
  }
  const handle = handleRef.current;
  const isOpen = handle.store.useState('open');

  return {
    close: handle.close,
    isOpen,
    open: handle.open,
    store: handle.store,
  };
};
