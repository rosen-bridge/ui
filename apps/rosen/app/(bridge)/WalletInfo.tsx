import { FunctionComponent } from 'react';

import { Avatar, Grid, IconButton, Typography } from '@rosen-bridge/ui-kit';

export interface WalletInfoProps {
  icon?: FunctionComponent;
  label?: string;
  onClick: () => void;
}

export const WalletInfo = ({ icon: Icon, label, onClick }: WalletInfoProps) => {
  const selected = Icon && label;
  return (
    <Grid container alignItems="center" justifyContent="space-between">
      <Typography lineHeight={2.5}>Wallet</Typography>
      {selected ? (
        <IconButton
          sx={{
            borderRadius: 0,
            padding: (theme) => theme.spacing(1),
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
        <Typography>-</Typography>
      )}
    </Grid>
  );
};
