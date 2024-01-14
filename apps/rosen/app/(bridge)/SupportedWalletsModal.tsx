import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Grid,
  Tooltip,
} from '@rosen-bridge/ui-kit';
import { WalletInfo } from '@rosen-ui/wallet-api';

interface SupportedWalletsModalProps {
  open: boolean;
  handleClose: () => void;
  chainName: string;
  supportedWallets: WalletInfo[];
}
/**
 * render a modal showing list of supported wallets for current chain
 *
 * @param open
 * @param handleClose
 * @param chainName
 * @param supportedWallets
 */
export const SupportedWalletsModal = ({
  open,
  handleClose,
  chainName,
  supportedWallets,
}: SupportedWalletsModalProps) => {
  return (
    <Dialog onClose={handleClose} open={open} maxWidth="tablet">
      <DialogContent>
        <DialogContentText>
          You do not have any of the supported wallets for {chainName} chain.
          Please install one of the following:
        </DialogContentText>
        <Grid container justifyContent="center" sx={{ pt: 5 }}>
          {supportedWallets.map(({ icon: WalletIcon, label, link, name }) => (
            <Tooltip title={name} key={label}>
              <Grid
                item
                sx={{
                  width: '8rem',
                  height: '8rem',
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  padding: 2,
                  margin: 1,
                  cursor: 'pointer',
                  '&:hover': {
                    backdropFilter: 'contrast(0.8)',
                  },
                }}
                component="a"
                href={link}
                target="_blank"
              >
                <WalletIcon key={label} />
              </Grid>
            </Tooltip>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
