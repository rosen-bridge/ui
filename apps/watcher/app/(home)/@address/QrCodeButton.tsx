import React from 'react';

import { QrcodeScan } from '@rosen-bridge/icons';
import { IconButton, SvgIcon } from '@rosen-bridge/ui-kit';

import QrCodeModal from './QrCodeModal';

interface QrCodeButtonProps {
  address: string;
}
/**
 * render a qrcode button which opens a modal showing the qrcode for the
 * provided address when clicked
 * @param address
 */
const QrCodeButton = ({ address }: QrCodeButtonProps) => {
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <IconButton onClick={handleOpen} sx={{ borderRadius: 0 }}>
        <SvgIcon>
          <QrcodeScan />
        </SvgIcon>
      </IconButton>
      <QrCodeModal open={open} handleClose={handleClose} address={address} />
    </>
  );
};

export default QrCodeButton;
