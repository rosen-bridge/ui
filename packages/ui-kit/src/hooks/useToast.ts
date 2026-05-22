import { ReactNode, useCallback, useMemo } from 'react';

import { Toast } from '@base-ui/react/toast';

export type ToastAddOptions = {
  type: 'info' | 'success' | 'error' | 'warning';
  description: ReactNode;
  more?: () => string;
};

export const useToast = () => {
  const toastManager = Toast.useToastManager();

  const add = useCallback(
    ({ type, description, more }: ToastAddOptions) => {
      return toastManager.add({
        type,
        description,
        timeout: 8000,
        data: more,
      });
    },
    [toastManager.add],
  );

  return useMemo(() => ({ add }), [add]);
};
