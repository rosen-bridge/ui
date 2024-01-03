import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Grid,
  Tooltip,
} from '@rosen-bridge/ui-kit';
import { Wallet, WalletInfo } from '@rosen-ui/wallet-api';

interface ChooseWalletsModalProps {
  open: boolean;
  handleClose: () => void;
  setSelectedWallet: ((wallet: Wallet) => Promise<void>) | undefined;
  chainName: string;
  supportedWallets: WalletInfo[];
  availableWallets: Wallet[];
}

/**
 * modal to allow user to choose a wallet
 *
 * @param open
 * @param handleClose
 * @param chainName
 * @param supportedWallets
 */
export const ChooseWalletsModal = ({
  open,
  handleClose,
  setSelectedWallet,
  chainName,
  supportedWallets,
  availableWallets,
}: ChooseWalletsModalProps) => {
  const handleConnect = async (wallet: Wallet) => {
    setSelectedWallet && (await setSelectedWallet(wallet));
    handleClose();
  };

  return (
    <Dialog onClose={handleClose} open={open} maxWidth="tablet">
      <DialogContent>
        <DialogContentText>
          Please choose any of the supported wallets for {chainName} chain.
        </DialogContentText>
        <Grid container justifyContent="center" sx={{ pt: 5 }}>
          {supportedWallets.map(
            ({ icon: WalletIcon, label, link, name }, index) => (
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
                    display: 'flex', // Added to make the Grid a flex container
                    flexDirection: 'column', // Stack children vertically
                    justifyContent: 'space-between', // Space between WalletIcon and button
                    '&:hover': {
                      backdropFilter: 'contrast(0.8)',
                    },
                  }}
                >
                  <Grid
                    sx={{
                      width: '100%',
                      display: 'flex', // Make this a flex container
                      justifyContent: 'center', // Center children horizontally
                      alignItems: 'center', // Center children vertically
                      height: '8rem', // Specify a height for the container
                      '> *': {
                        width: '64px',
                        height: '64px',
                      },
                    }}
                    component="a"
                    href={link}
                    target="_blank"
                  >
                    <WalletIcon key={label} />
                  </Grid>
                  <Button
                    onClick={(event) => {
                      event.preventDefault(); // This will prevent the default action
                      handleConnect(availableWallets[index]);
                    }}
                    variant="contained"
                    size="small"
                    sx={{ mt: 2 }} // Add margin top to separate from WalletIcon
                  >
                    Connect
                  </Button>
                </Grid>
              </Tooltip>
            ),
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
