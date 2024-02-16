import React from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import { Copy } from '@rosen-bridge/icons';
import {
  IconButton,
  SvgIcon,
  SuccessfulCopySnackbar,
} from '@rosen-bridge/ui-kit';

interface CopyButtonProps {
  address: string;
}
/**
 * render a copy button which copies the provided address to clipboard when
 * clicked
 *
 * @param address
 */
const CopyButton = ({ address }: CopyButtonProps) => {
  const [open, setOpen] = React.useState(false);

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  return (
    <>
      <CopyToClipboard text={address} onCopy={() => setOpen(true)}>
        <IconButton sx={{ borderRadius: 0 }}>
          <SvgIcon>
            <Copy />
          </SvgIcon>
        </IconButton>
      </CopyToClipboard>
      <SuccessfulCopySnackbar open={open} handleClose={handleClose} />
    </>
  );
};

export default CopyButton;
