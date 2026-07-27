import React, { useState } from 'react';

import { Typography } from '@mui/material';
import { Network as NetworkType } from '@rosen-ui/types';

import { useToast } from '../../hooks';
import { Avatar } from '../avatar';
import { Icon, IconProps } from '../icon';
import { IconButton } from '../iconButton';
import { Network } from '../network';
import { Stack } from '../stack';
import { Divider } from './Divider';
import { EnhancedDialog } from './EnhancedDialog';
import { EnhancedDialogContent } from './EnhancedDialogContent';
import { EnhancedDialogTitle } from './EnhancedDialogTitle';

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

  const toast = useToast();

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
      toast.add({
        type: 'error',
        description: 'Failed to load app information',
      });
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
          icon="ExclamationCircle"
          onClose={() => setOpen(false)}
        >
          <Typography variant="h2" fontWeight="bold">
            About Rosen Bridge
          </Typography>
        </EnhancedDialogTitle>
        <EnhancedDialogContent>
          <Stack spacing={1}>
            <Divider borderStyle="dashed">
              <Typography noWrap color="text-secondary" variant="body2">
                App Version
              </Typography>
            </Divider>
            {versions && (
              <>
                {versions.map(({ label, icon, value }) => (
                  <Stack key={label} direction="row" justify="between">
                    <Stack direction="row" spacing={1} align="center">
                      <Avatar size="32px" background="neutral-contrastText">
                        <Icon name={icon} />
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
                  <Typography noWrap color="text-secondary" variant="body2">
                    Network Height
                  </Typography>
                </Divider>
                {networks.map(({ network, height }) => (
                  <Stack key={network} direction="row" justify="between">
                    <Network value={network} />
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
        color="inherit"
        disabled={loading}
        loading={loading}
        onClick={handleClick}
      >
        <Icon name="InfoCircle" />
      </IconButton>
    </div>
  );
};
