import QrCode from 'qrcode.react';

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@rosen-bridge/ui-kit';

interface QrCodeModalProps {
  address: string;
  handleClose: () => void;
  open: boolean;
}
/**
 * render a modal showing qrcode for the provided address
 *
 * @param address
 * @param handleClose
 * @param open
 */
const QrCodeModal = ({ handleClose, open, address }: QrCodeModalProps) => {
  return (
    <Dialog onClose={handleClose} open={open} maxWidth="tablet">
      <DialogContent>
        <Box sx={{ color: '#ddd', textAlign: 'center', my: 3 }}>
          <QrCode size={200} value={address} />
        </Box>
        <DialogContentText sx={{ wordBreak: 'break-all', textAlign: 'center' }}>
          {address}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default QrCodeModal;
