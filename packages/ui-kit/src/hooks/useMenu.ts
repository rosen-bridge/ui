import { Menu as MenuBaseUI } from '@base-ui/react/menu';

export const useMenu = <T = unknown>() => {
  const { open, isOpen, store, close } = MenuBaseUI.createHandle<T>();

  return {
    open,
    isOpen,
    store,
    close,
  };
};
