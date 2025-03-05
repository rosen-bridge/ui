import { FunctionComponent } from 'react';

import { LinkBroken } from '@rosen-bridge/icons';
import {
  Avatar,
  Button,
  Grid,
  IconButton,
  Typography,
} from '@rosen-bridge/ui-kit';

export interface WalletInfoProps {
  icon?: FunctionComponent;
  label?: string;
  disconnect: () => void;
  onClick: () => void;
}

export const WalletInfo = ({
  icon: Icon,
  label,
  disconnect,
  onClick,
}: WalletInfoProps) => {
  const selected = Icon && label;
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
  );
};
