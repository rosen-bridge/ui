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
  Stack as StackMUI,
  Tooltip,
  Box,
  Typography,
  EnhancedDialog,
  InjectOverrides,
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

const Stack = InjectOverrides(StackMUI);
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
        <Stack
          display="flex"
          flexDirection="row"
          justifyContent="center"
          flexWrap="wrap"
          alignItems="flex-start"
          gap={2}
          width="100%"
        >
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
              <Card
                style={{ width: '100%' }}
                overrides={{
                  tablet: { style: { width: 'fit-content' } },
                }}
                key={wallet.label}
                backgroundColor="background.paper"
              >
                <CardBody
                  style={{ padding: '0' }}
                  overrides={{ tablet: { style: { padding: '16px' } } }}
                >
                  <Tooltip title={'wallet.name'}>
                    <Stack
                      overrides={{
                        mobile: {
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '8px',
                        },
                        tablet: {
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        },
                      }}
                      gap={2}
                    >
                      <WalletIconWrapper
                        size="56px"
                        overrides={{ tablet: { size: '120px' } }}
                      >
                        <Icon />
                      </WalletIconWrapper>
                      <Box
                        style={{ display: 'flex', alignItems: 'center' }}
                        overrides={{
                          tablet: {
                            style: {
                              display: 'none',
                            },
                          },
                        }}
                      >
                        <Typography variant="body1" noWrap>
                          {wallet.name}
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        size="small"
                        style={{ width: 'fit-content', height: 'auto' }}
                        disabled={!wallet.isAvailable()}
                        color={isConnected ? 'inherit' : 'primary'}
                        onClick={handleClick}
                      >
                        {isConnected ? 'Disconnect' : 'Connect'}
                      </Button>
                    </Stack>
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
//todo: fix
const WalletIconWrapper = InjectOverrides(
  ({ children, size }: { children: JSX.Element; size: string | number }) => {
    return (
      <div
        style={{
          width: size,
          height: size,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </div>
    );
  },
);
