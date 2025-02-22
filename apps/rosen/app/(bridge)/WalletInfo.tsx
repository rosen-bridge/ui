import { FunctionComponent } from 'react';

import { Disconnect } from '@rosen-bridge/icons';
import {
  Avatar,
  Button,
  Grid,
  IconButton,
  Typography,
} from '@rosen-bridge/ui-kit';
import { Wallet } from '@rosen-ui/wallet-api';

import { useWallet } from '@/_hooks';

export interface WalletInfoProps {
  icon?: FunctionComponent;
  label?: string;
  wallet?: Wallet;
  onClick: () => void;
}

export const WalletInfo = ({
  icon: Icon,
  label,
  wallet,
  onClick,
}: WalletInfoProps) => {
  const selected = Icon && label;
  const { setSelected } = useWallet();

  return (
    <Grid container alignItems="center" justifyContent="space-between">
      {selected ? (
        <IconButton
          sx={{
            borderRadius: 1,
            margin: 0,
          }}
          onClick={onClick}
        >
          <Grid container alignItems="center" justifyContent="center" gap={1}>
            {Icon && (
              <Avatar
                sx={{
                  width: 18,
                  height: 18,
                  background: 'transparent',
                }}
              >
                <Icon />
              </Avatar>
            )}
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
            borderRadius: 1,
            margin: 0,
          }}
          startIcon={<Disconnect />}
          onClick={() => {
            if (wallet) {
              wallet.disconnect();
              setSelected?.(undefined);
            }
          }}
        >
          Disconnect
        </Button>
      ) : (
        <Typography>-</Typography>
      )}
    </Grid>
  );
};
