import React, { useState } from 'react';

import { Typography } from '@mui/material';
import { Network as NetworkType } from '@rosen-ui/types';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components';

import { Avatar } from '../avatar';
import { Icon, IconProps } from '../icon';
import { IconButton } from '../iconButton';
import { Network } from '../network';
import { Stack } from '../stack';
import { useToast } from '../../hooks';
import { Divider } from './Divider';

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
        description: 'Failed to load app information'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Dialog
        maxWidth="tablet"
        open={open}
        stickOn="tablet"
        onClose={() => setOpen(false)}
      >
        <DialogHeader closeable icon="ExclamationCircle">
          <DialogTitle>About Rosen Bridge</DialogTitle>
        </DialogHeader>
        <DialogContent>
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
        </DialogContent>
      </Dialog>
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
