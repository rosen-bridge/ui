import { ReactNode, useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
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
    <Dialog maxWidth="tablet" open={open} onClose={handleClose}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <DialogContent>{content}</DialogContent>
      <DialogFooter>
        <Button
          variant="text"
          loading={buttonLoading}
          onClick={handleConfirmClick}
        >
          {buttonText}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
