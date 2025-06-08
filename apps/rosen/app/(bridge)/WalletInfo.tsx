import { useState } from 'react';

import { LinkBroken } from '@rosen-bridge/icons';
import {
  Avatar,
  Button,
  Card,
  Grid,
  IconButton,
  Typography,
} from '@rosen-bridge/ui-kit';

import { useNetwork, useWallet } from '@/_hooks';

import { ChooseWalletModal } from './ChooseWalletModal';

export const WalletInfo = () => {
  const {
    select: setSelectedWallet,
    wallets,
    selected: selectedWallet,
    disconnect,
  } = useWallet();
  const { selectedSource } = useNetwork();
  const [chooseWalletsModalOpen, setChooseWalletsModalOpen] = useState(false);
  const Icon = selectedWallet?.iconReact;
  const label = selectedWallet?.label;
  const selected = Icon && label;

  return (
    <Card
      sx={{
        display: 'flex',
        padding: '12px 25px',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.secondary.light
            : theme.palette.background.paper,
      }}
    >
      <Grid container alignItems="center" justifyContent="space-between">
        {selected ? (
          <IconButton
            sx={{
              borderRadius: 1,
              margin: 0,
            }}
            onClick={() => setChooseWalletsModalOpen(true)}
          >
            <Grid container alignItems="center" justifyContent="center" gap={1}>
              <Avatar
                sx={{
                  width: 18,
                  height: 18,
                  background: 'transparent',
                }}
              >
                <Icon />
              </Avatar>
              <Typography>{label}</Typography>
            </Grid>
          </IconButton>
        ) : (
          <Typography lineHeight={2.5}>Wallet</Typography>
        )}
        {selected ? (
          <Button
            sx={{
              color: (theme) => theme.palette.secondary.dark,
              fill: (theme) => theme.palette.secondary.dark,
              borderRadius: 1,
              margin: 0,
            }}
            startIcon={<LinkBroken width="24px" />}
            onClick={() => {
              disconnect();
            }}
          >
            Disconnect
          </Button>
        ) : (
          <Typography>-</Typography>
        )}
      </Grid>
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
