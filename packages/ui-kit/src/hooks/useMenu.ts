import { Menu as MenuBaseUI } from '@base-ui/react/menu';

export const useMenu = () => {
  const { isOpen, open, close, store } = MenuBaseUI.createHandle();

  return {
    close,
    isOpen,
    open,
    store,
  };
};
