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

interface ChooseWalletModalProps {
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
 * @param setSelectedWallet
 * @param chainName
 * @param supportedWallets
 * @param availableWallets
 *
 */
export const ChooseWalletModal = ({
  open,
  handleClose,
  setSelectedWallet,
  chainName,
  supportedWallets,
  availableWallets,
}: ChooseWalletModalProps) => {
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
        <Grid
          container
          justifyContent="center"
          sx={{
            pt: (theme) => theme.spacing(1),
            gap: (theme) => theme.spacing(2),
            mt: (theme) => theme.spacing(4),
          }}
        >
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
                    padding: (theme) => theme.spacing(1),
                    cursor: 'pointer',
                    justifyContent: 'space-between',
                    '&:hover': {
                      backdropFilter: 'contrast(0.8)',
                    },
                  }}
                >
                  <Grid
                    sx={{
                      width: '100%',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '8rem',
                      '> *': {
                        width: '100%',
                        height: '64px',
                      },
                    }}
                    component="a"
                    href={link}
                    target="_blank"
                  >
                    <WalletIcon />
                  </Grid>
                  <Button
                    onClick={(event) => {
                      event.preventDefault();
                      handleConnect(availableWallets[index]);
                    }}
                    variant="contained"
                    size="small"
                    sx={{ mt: (theme) => theme.spacing(1), width: '100%' }}
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
