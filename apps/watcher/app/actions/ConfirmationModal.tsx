import { ReactNode, useState } from 'react';

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LoadingButton,
} from '@rosen-bridge/ui-kit';

interface ConfirmationModalProps {
  open: boolean;
  title: string;
  content: ReactNode | string;
  buttonText: string;
  onConfirm: () => Promise<void>;
  handleClose: () => void;
}
/**
 * render a modal showing some text and a confirm button
 *
 * @param open
 * @param title
 * @param content
 * @param buttonText
 * @param onConfirm
 * @param handleClose
 */
export const ConfirmationModal = ({
  open,
  title,
  content,
  buttonText,
  onConfirm,
  handleClose,
}: ConfirmationModalProps) => {
  const [buttonLoading, setButtonLoading] = useState(false);

  const handleConfirmClick = async () => {
    setButtonLoading(true);
    await onConfirm();
    setButtonLoading(false);
    handleClose();
  };

  return (
    <Dialog onClose={handleClose} open={open} maxWidth="tablet">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {typeof content === 'string' ? (
          <DialogContentText>{content}</DialogContentText>
        ) : (
          content
        )}
      </DialogContent>
      <DialogActions>
        <LoadingButton
          variant="text"
          loading={buttonLoading}
          onClick={handleConfirmClick}
        >
          {buttonText}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};
