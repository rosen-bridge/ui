import type { ReactNode } from 'react';

import { Toast } from '@base-ui/react/toast';

export type ToastAddOptions = {
  type: 'info' | 'success' | 'error' | 'warning';
  description: ReactNode;
  dismissible?: boolean;
  timeout?: number;
  more?: () => string;
};

export const useToast = () => {
  const { add: addToast } = Toast.useToastManager();

  const add = ({ type, description, dismissible, timeout, more }: ToastAddOptions) => {
    return addToast({
      type,
      description,
      timeout,
      data: {
        dismissible,
        more,
      },
    });
  };

  return { add };
};
