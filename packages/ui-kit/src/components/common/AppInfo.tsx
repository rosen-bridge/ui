import React, { useState } from 'react';

import { CircularProgress, Typography, IconButton } from '@mui/material';
import { ExclamationCircle, InfoCircle } from '@rosen-bridge/icons';
import { Network as NetworkType } from '@rosen-ui/types';

import { useSnackbar } from '../../hooks';
import { Icon, IconProps } from '../icon';
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
  icon: IconProps['name'];
};

export type AppInfoProps = {
  children?: React.ReactNode;
  loading?: boolean;
  resolver?: () => Promise<{
    networks?: NetworkHeight[];
    versions?: VersionApp[];
  }>;
};

export const AppInfo = ({ children, resolver }: AppInfoProps) => {
  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const [versions, setVersions] = useState<VersionApp[]>();

  const [networks, setNetworks] = useState<NetworkHeight[]>();

  const { openSnackbar } = useSnackbar();

  const handleClick = async () => {
    if (!resolver) {
      setOpen(true);
      return;
    }

    try {
      setLoading(true);

      const result = await resolver();

      setVersions(result.versions);
      setNetworks(result.networks);

      setOpen(true);
    } catch {
      openSnackbar('Failed to load app information', 'error');
    } finally {
      setLoading(false);
    }
  };

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
                {versions.map(({ label, icon, value }) => (
                  <Stack key={label} direction="row" justify="between">
                    <Stack direction="row" spacing={1} align="center">
                      <Avatar size="32px" background="neutral.contrastText">
                        <Icon name={icon} size="medium" />
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
        onClick={handleClick}
      >
        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          <SvgIcon size="medium">
            <InfoCircle fill="currentColor" />
          </SvgIcon>
        )}
      </IconButton>
    </div>
  );
};
