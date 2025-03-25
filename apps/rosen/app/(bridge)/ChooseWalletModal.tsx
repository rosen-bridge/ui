import { useEffect, useState } from 'react';

import { Wallet as WalletIcon } from '@rosen-bridge/icons';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogContentText,
  EnhancedDialogTitle,
  Grid,
  Tooltip,
} from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';
import { Wallet } from '@rosen-ui/wallet-api';

import { useTransactionFormData } from '@/_hooks';

interface ChooseWalletModalProps {
  open: boolean;
  handleClose: () => void;
  setSelectedWallet: ((wallet: Wallet) => Promise<void>) | undefined;
  chainName?: Network;
  wallets: Wallet[];
}

/**
 * modal to allow user to choose a wallet
 *
 * @param open
 * @param handleClose
 * @param setSelectedWallet
 * @param chainName
 * @param wallets
 *
 */
export const ChooseWalletModal = ({
  open,
  handleClose,
  setSelectedWallet,
  chainName,
  wallets,
}: ChooseWalletModalProps) => {
  const [, forceUpdate] = useState('');

  const { sourceValue } = useTransactionFormData();

  const handleConnect = async (wallet: Wallet) => {
    setSelectedWallet && (await setSelectedWallet(wallet));
    handleClose();
  };

  useEffect(() => {
    if (!open) return;

    const timeout = setInterval(() => {
      forceUpdate(wallets.map((wallet) => wallet.isAvailable()).join(':'));
    }, 2000);

    return () => {
      clearInterval(timeout);
    };
  }, [open, wallets]);

  return (
    <Dialog open={open} maxWidth="laptop" onClose={handleClose}>
      <EnhancedDialogTitle icon={<WalletIcon />} onClose={handleClose}>
        Choose Wallet
      </EnhancedDialogTitle>
      <DialogContent>
        <DialogContentText>
          Please choose any of the supported wallets for {chainName} chain.
        </DialogContentText>
        <Alert severity="warning" sx={{ my: '1rem' }}>
          It may be necessary to reload this page after the following extensions
          have been installed in order to connect to them.
        </Alert>
        {sourceValue == NETWORKS.bitcoin.key && (
          <Alert severity="warning" sx={{ my: '1rem' }}>
            We only support native SegWit addresses (P2WPKH or P2WSH) for the
            source address.
          </Alert>
        )}
        <Grid container justifyContent="center" gap={2}>
          {wallets.map((wallet) => {
            const Icon = wallet.icon;
            return (
              <Card key={wallet.label}>
                <CardContent>
                  <Tooltip title={wallet.name}>
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 3,
                        alignItems: 'center',
                        flexDirection: 'column',
                        svg: {
                          height: (theme) => theme.spacing(13),
                          width: (theme) => theme.spacing(13),
                        },
                      }}
                    >
                      <Icon />
                      <Button
                        variant="contained"
                        size="small"
                        sx={{ width: '100%' }}
                        disabled={!wallet.isAvailable()}
                        onClick={(event) => {
                          event.preventDefault();
                          handleConnect(wallet);
                        }}
                      >
                        Connect
                      </Button>
                    </Box>
                  </Tooltip>
                </CardContent>
              </Card>
            );
          })}
        </Grid>
      </DialogContent>
    </Dialog>
  );
};
