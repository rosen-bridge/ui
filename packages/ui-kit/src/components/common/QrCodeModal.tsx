import { Button } from '@mui/material';
import QrCode from 'qrcode.react';

import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '../base';

interface QrCodeModalProps {
  text: string;
  handleClose: () => void;
  open: boolean;
}
/**
 * render a modal showing qrcode for the provided text
 *
 * @param text
 * @param handleClose
 * @param open
 */
export const QrCodeModal = ({ handleClose, open, text }: QrCodeModalProps) => {
  return (
    <Dialog onClose={handleClose} open={open} maxWidth="tablet">
      <DialogContent>
        <Box sx={{ textAlign: 'center', my: 3 }}>
          <QrCode size={200} value={text} />
        </Box>
        <DialogContentText sx={{ wordBreak: 'break-all', textAlign: 'center' }}>
          {text}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
