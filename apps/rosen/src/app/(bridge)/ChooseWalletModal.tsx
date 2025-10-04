import { MouseEvent, useEffect, useState } from 'react';

import { Wallet as WalletIcon } from '@rosen-bridge/icons';
import {
  Alert,
  Card,
  CardBody,
  Button,
  DialogContent,
  DialogContentText,
  EnhancedDialogTitle,
  Stack,
  Tooltip,
  EnhancedDialog,
  StackMui,
} from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';
import { Wallet } from '@rosen-ui/wallet-api';

import { useTransactionFormData } from '@/hooks';

interface ChooseWalletModalProps {
  selectedWallet: Wallet | undefined;
  disconnect: () => void;
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
  selectedWallet,
  disconnect,
  open,
  handleClose,
  setSelectedWallet,
  chainName,
  wallets,
}: ChooseWalletModalProps) => {
  const [, forceUpdate] = useState('');

  const { sourceValue } = useTransactionFormData();

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
    <EnhancedDialog
      maxWidth="desktop"
      open={open}
      stickOn="tablet"
      onClose={handleClose}
    >
      <EnhancedDialogTitle icon={<WalletIcon />} onClose={handleClose}>
        Choose Wallet
      </EnhancedDialogTitle>
      <DialogContent>
        <DialogContentText>
          Please choose any of the supported wallets for {chainName} chain.
        </DialogContentText>
        <Alert severity="warning" style={{ margin: '1rem 0' }}>
          It may be necessary to reload this page after the following extensions
          have been installed in order to connect to them.
        </Alert>
        {sourceValue == NETWORKS.bitcoin.key && (
          <Alert severity="warning" style={{ margin: '1rem 0' }}>
            We only support native SegWit addresses (P2WPKH or P2WSH) for the
            source address.
          </Alert>
        )}
        <Stack justify="center" spacing={2} direction="row" wrap>
          {wallets.map((wallet) => {
            const Icon = wallet.iconReact;
            const isConnected = selectedWallet?.name === wallet.name;

            const handleClick = async (event: MouseEvent) => {
              event.preventDefault();
              if (isConnected) {
                disconnect();
              } else if (wallet.isAvailable() && setSelectedWallet) {
                await setSelectedWallet(wallet);
              }
              handleClose();
            };

            return (
              <Card key={wallet.label} backgroundColor="background.paper">
                <CardBody>
                  <Tooltip title={wallet.name}>
                    <StackMui
                      gap={3}
                      sx={{
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
                        color={isConnected ? 'inherit' : 'primary'}
                        onClick={handleClick}
                      >
                        {isConnected ? 'Disconnect' : 'Connect'}
                      </Button>
                    </StackMui>
                  </Tooltip>
                </CardBody>
              </Card>
            );
          })}
        </Stack>
      </DialogContent>
    </EnhancedDialog>
  );
};
