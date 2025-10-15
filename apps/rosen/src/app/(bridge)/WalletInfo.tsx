import { useState } from 'react';

import { LinkBroken } from '@rosen-bridge/icons';
import { Wallet } from '@rosen-bridge/icons';
import {
  Avatar,
  Card,
  CardBody,
  Button,
  Grid,
  SvgIcon,
  Typography,
  Button2,
} from '@rosen-bridge/ui-kit';

import { useNetwork, useWallet } from '@/hooks';

import { ChooseWalletModal } from './ChooseWalletModal';

export const WalletInfo = () => {
  const {
    select: setSelectedWallet,
    state: walletState,
    wallets,
    selected: selectedWallet,
    disconnect,
  } = useWallet();
  const { selectedSource } = useNetwork();
  const [chooseWalletsModalOpen, setChooseWalletsModalOpen] = useState(false);

  const Icon = selectedWallet?.iconReact;
  const label = selectedWallet?.label;

  return (
    <Card
      backgroundColor={
        walletState === 'CONNECTED' || walletState === 'DISCONNECTING'
          ? 'secondary.light'
          : 'primary.light'
      }
    >
      <CardBody
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 56,
        }}
      >
        {walletState === 'IDLE' && (
          <Typography variant="body2" color="text.secondary">
            Select source to see available wallets.
          </Typography>
        )}
        {walletState === 'DISCONNECTED' && (
          <Button
            variant="text"
            startIcon={
              <SvgIcon>
                <Wallet />
              </SvgIcon>
            }
            style={{ borderRadius: '8px', marginLeft: '-8px' }}
            onClick={() => setChooseWalletsModalOpen(true)}
          >
            Choose Wallet
          </Button>
        )}
        {walletState === 'CONNECTING' && (
          <Typography color="text.secondary">
            Connecting to wallet...
          </Typography>
        )}
        {walletState === 'DISCONNECTING' && (
          <Typography color="text.secondary">Disconnecting...</Typography>
        )}
        {walletState === 'CONNECTED' && (
          <>
            <Button2
              style={{
                borderRadius: '8px',
                marginLeft: '-8px',
              }}
              onClick={() => setChooseWalletsModalOpen(true)}
            >
              <Grid
                container
                alignItems="center"
                justifyContent="center"
                gap={1}
              >
                {Icon && (
                  <Avatar
                    style={{
                      width: 24,
                      height: 24,
                      background: 'transparent',
                    }}
                  >
                    <Icon />
                  </Avatar>
                )}
                <Typography>{label}</Typography>
              </Grid>
            </Button2>
            <Button
              sx={{
                color: (theme) => theme.palette.secondary.dark,
                borderRadius: 0.5,
                mr: -1,
              }}
              startIcon={
                <SvgIcon size="24px" color="secondary.dark">
                  <LinkBroken />
                </SvgIcon>
              }
              onClick={() => {
                disconnect();
              }}
            >
              Disconnect
            </Button>
          </>
        )}
      </CardBody>
      <ChooseWalletModal
        selectedWallet={selectedWallet}
        disconnect={disconnect}
        open={chooseWalletsModalOpen}
        chainName={selectedSource?.name}
        setSelectedWallet={setSelectedWallet}
        handleClose={() => setChooseWalletsModalOpen(false)}
        wallets={wallets || []}
      />
    </Card>
  );
};
