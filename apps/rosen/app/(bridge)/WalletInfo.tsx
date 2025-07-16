import { useState } from 'react';

import { LinkBroken } from '@rosen-bridge/icons';
import { Wallet } from '@rosen-bridge/icons';
import {
  Avatar,
  Button,
  Card,
  Grid,
  IconButton,
  styled,
  SvgIcon,
  Typography,
} from '@rosen-bridge/ui-kit';

import { useNetwork, useWallet } from '@/_hooks';

import { ChooseWalletModal } from './ChooseWalletModal';

const StyledCard = styled(Card)(({ theme }) => ({
  'display': 'flex',
  'alignItems': 'center',
  'justifyContent': 'space-between',
  'height': 56,
  'padding': theme.spacing(1, 2),
  'backgroundColor': theme.palette.primary.light,
  '&.connected': {
    backgroundColor: theme.palette.secondary.light,
  },
}));

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
    <StyledCard
      className={
        walletState === 'CONNECTED' || walletState === 'DISCONNECTING'
          ? 'connected'
          : ''
      }
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
          sx={{ borderRadius: 0.5, ml: -1 }}
          onClick={() => setChooseWalletsModalOpen(true)}
        >
          Choose Wallet
        </Button>
      )}
      {walletState === 'CONNECTING' && (
        <Typography color="text.secondary">Connecting to wallet...</Typography>
      )}
      {walletState === 'DISCONNECTING' && (
        <Typography color="text.secondary">Disconnecting...</Typography>
      )}
      {walletState === 'CONNECTED' && (
        <>
          <IconButton
            sx={{
              borderRadius: 0.5,
              ml: -1,
            }}
            onClick={() => setChooseWalletsModalOpen(true)}
          >
            <Grid container alignItems="center" justifyContent="center" gap={1}>
              {Icon && (
                <Avatar
                  sx={{
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
          </IconButton>
          <Button
            sx={{
              color: (theme) => theme.palette.secondary.dark,
              fill: (theme) => theme.palette.secondary.dark,
              borderRadius: 0.5,
              mr: -1,
            }}
            startIcon={<LinkBroken width="24px" />}
            onClick={() => {
              disconnect();
            }}
          >
            Disconnect
          </Button>
        </>
      )}

      <ChooseWalletModal
        selectedWallet={selectedWallet}
        disconnect={disconnect}
        open={chooseWalletsModalOpen}
        chainName={selectedSource?.name}
        setSelectedWallet={setSelectedWallet}
        handleClose={() => setChooseWalletsModalOpen(false)}
        wallets={wallets || []}
      />
    </StyledCard>
  );
};
