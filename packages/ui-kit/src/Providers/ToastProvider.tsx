import { ReactNode } from 'react';

import { Toast } from '@base-ui/react/toast';

import { Alert, AlertProps, CopyButton } from '@/components';

import './ToastProvider.css';

export type ToastProviderProps = {
  children?: ReactNode;
};

export const ToastProvider = ({ children }: ToastProviderProps) => {
  return (
    <Toast.Provider limit={1}>
      {children}
      <Toast.Portal>
        <Toast.Viewport className="RosenToast-viewport">
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
};

const ToastList = () => {
  const { toasts } = Toast.useToastManager();
  return toasts.map((toast) => (
    <Toast.Root key={toast.id} toast={toast} className="RosenToast">
      <Toast.Content className="RosenToast-content">
        <Alert
          variant="standard"
          severity={toast.type as AlertProps['severity']}
          action={
            toast.data && (
              <CopyButton
                value={() => toast.data?.()}
                color="inherit"
                size="small"
                style={{ paddingTop: '5px', paddingBottom: '5px' }}
              />
            )
          }
        >
          {toast.description}
        </Alert>
      </Toast.Content>
    </Toast.Root>
  ));
};
