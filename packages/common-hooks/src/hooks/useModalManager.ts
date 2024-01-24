import { useState, useCallback } from 'react';

/**
 * a simple utility hook to manage a modals general status
 */

export const useModalManager = () => {
  const [open, setOpen] = useState(false);

  const handleOpenModal = useCallback(() => setOpen(true), []);
  const handleCloseModal = useCallback(() => setOpen(false), []);

  return {
    isOpen: open,
    handleOpenModal,
    handleCloseModal,
  };
};
