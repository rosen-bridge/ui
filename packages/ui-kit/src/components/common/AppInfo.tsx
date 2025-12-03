import React, { useState } from 'react';

import { CircularProgress, Typography, IconButton } from '@mui/material';
import { ExclamationCircle, InfoCircle } from '@rosen-bridge/icons';
import { Network as NetworkType } from '@rosen-ui/types';

import { Avatar } from './Avatar';
import { Network } from './display';
import { Divider } from './Divider';
import { EnhancedDialog } from './EnhancedDialog';
import { EnhancedDialogContent } from './EnhancedDialogContent';
import { EnhancedDialogTitle } from './EnhancedDialogTitle';
import { Stack } from './Stack';
import { SvgIcon } from './SvgIcon';

type NetworkHeight = {
  network: NetworkType;
  height?: number;
};

type VersionApp = {
  label?: string;
  value?: string;
  icon: React.ReactNode;
};

export type AppInfoProps = {
  children?: React.ReactNode;
  versions?: VersionApp[];
  networks?: NetworkHeight[];
  loading?: boolean;
};
export const AppInfo = ({
  children,
  loading,
  networks,
  versions,
}: AppInfoProps) => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <EnhancedDialog
        maxWidth="tablet"
        open={open}
        stickOn="tablet"
        onClose={() => setOpen(false)}
      >
        <EnhancedDialogTitle
          icon={<ExclamationCircle />}
          onClose={() => setOpen(false)}
        >
          <Typography variant="h2" fontWeight="bold">
            About Rosen Bridge
          </Typography>
        </EnhancedDialogTitle>
        <EnhancedDialogContent>
          <Stack spacing={1}>
            <Divider borderStyle="dashed">
              <Typography noWrap color="text.secondary" variant="body2">
                App Version
              </Typography>
            </Divider>
            {versions && (
              <>
                {versions.map(({ label, icon: Icon, value }) => (
                  <Stack key={label} direction="row" justify="between">
                    <Stack direction="row" spacing={1} align="center">
                      <Avatar
                        style={{ width: '32px', height: '32px' }}
                        background="neutral.contrastText"
                      >
                        <SvgIcon size="medium">{Icon}</SvgIcon>
                      </Avatar>
                      <Typography noWrap variant="body1">
                        {label}
                      </Typography>
                    </Stack>
                    {value}
                  </Stack>
                ))}
              </>
            )}

            {networks && (
              <>
                <Divider borderStyle="dashed">
                  <Typography noWrap color="text.secondary" variant="body2">
                    Network Height
                  </Typography>
                </Divider>
                {networks.map(({ network, height }) => (
                  <Stack key={network} direction="row" justify="between">
                    <Network name={network} />
                    <Typography>{height}</Typography>
                  </Stack>
                ))}
              </>
            )}
          </Stack>
          {children}
        </EnhancedDialogContent>
      </EnhancedDialog>

      <IconButton
        disabled={loading}
        sx={{ padding: '12px', color: 'inherit' }}
        onClick={() => setOpen(!open)}
      >
        {loading ? (
          <CircularProgress size={15} color="inherit" />
        ) : (
          <SvgIcon size="medium">
            <InfoCircle fill="currentColor" />
          </SvgIcon>
        )}
      </IconButton>
    </div>
  );
};
