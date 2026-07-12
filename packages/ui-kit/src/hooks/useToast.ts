import { type ReactNode, useCallback, useMemo } from 'react';

import { Toast } from '@base-ui/react/toast';

export type ToastAddOptions = {
  type: 'info' | 'success' | 'error' | 'warning';
  description: ReactNode;
  dismissible?: boolean;
  timeout?: number;
  more?: () => string;
};

export const useToast = () => {
  const toastManager = Toast.useToastManager();

  const add = useCallback(
    ({ type, description, dismissible, timeout, more }: ToastAddOptions) => {
      return toastManager.add({
        type,
        description,
        timeout,
        data: {
          dismissible,
          more,
        },
      });
    },
    [toastManager.add],
  );

  return useMemo(() => ({ add }), [add]);
};
