import { ReactNode, useCallback, useState } from 'react';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@/components';

export type ConfirmOptions = {
  title: string;
  content: ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => Promise<void>;
};

export const useConfirm = () => {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [loading, setLoading] = useState(false);
  const [resolver, setResolver] = useState<{
    resolve: (value: boolean) => void;
    reject: (reason?: unknown) => void;
  } | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setLoading(false);
    return new Promise<boolean>((resolve, reject) => {
      setResolver({ resolve, reject });
    });
  }, []);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await options?.onConfirm?.();
      resolver?.resolve(true);
    } catch (error) {
      resolver?.reject(error);
    } finally {
      setOptions(null);
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (loading) return;
    resolver?.resolve(false);
    setOptions(null);
  };

  const ConfirmDialog = options ? (
    <Dialog open onClose={handleCancel} maxWidth="tablet">
      <DialogTitle>{options.title}</DialogTitle>
      <DialogContent>
        {typeof options.content === 'string' ? (
          <DialogContentText>{options.content}</DialogContentText>
        ) : (
          options.content
        )}
      </DialogContent>
      <DialogActions>
        <Button variant="text" disabled={loading} onClick={handleCancel}>
          {options.cancelText ?? 'Cancel'}
        </Button>
        <Button variant="text" loading={loading} onClick={handleConfirm}>
          {options.confirmText ?? 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  ) : null;

  return { confirm, ConfirmDialog };
};
