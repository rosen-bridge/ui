import type React from 'react';
import { useState } from 'react';

import type { Network as NetworkType } from '@rosen-ui/types';

import {
  Dialog,
  DialogBody,
  DialogCloseButton,
  DialogHeader,
  DialogIcon,
  DialogTitle,
  Typography,
} from '@/components';

import { useToast } from '../../hooks';
import { Avatar } from '../avatar';
import { Icon, type IconProps } from '../icon';
import { IconButton } from '../iconButton';
import { Network } from '../network';
import { Stack } from '../stack';
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

  const [versions, setVersions] = useState<VersionApp[]>([]);

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

      setVersions(result.versions || []);
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
      <Dialog open={open} unstick="tablet" width="small" onClose={() => setOpen(false)}>
        <DialogHeader>
          <DialogIcon name="ExclamationCircle" />
          <DialogTitle>About Rosen Bridge</DialogTitle>
          <DialogCloseButton />
        </DialogHeader>
        <DialogBody>
          <Stack spacing={1}>
            <Divider borderStyle="dashed">
              <Typography noWrap color="text-secondary" variant="h4">
                App Version
              </Typography>
            </Divider>
            {versions.map(({ label, icon, value }) => (
              <Stack key={label} direction="row" justify="between">
                <Stack direction="row" spacing={1} align="center">
                  <Avatar size="32px" background="neutral-contrastText">
                    <Icon name={icon} />
                  </Avatar>
                  <Typography color="text-secondary" noWrap variant="body1">
                    {label}
                  </Typography>
                </Stack>
                {value}
              </Stack>
            ))}

            {networks && (
              <>
                <Divider borderStyle="dashed">
                  <Typography noWrap color="text-secondary" variant="h4">
                    Network Height
                  </Typography>
                </Divider>
                {networks.map(({ network, height }) => (
                  <Stack key={network} direction="row" justify="between">
                    <Network value={network} />
                    <Typography color="text-secondary" variant="body1">
                      {height}
                    </Typography>
                  </Stack>
                ))}
              </>
            )}
          </Stack>
          {children}
        </DialogBody>
      </Dialog>

      <IconButton color="inherit" disabled={loading} loading={loading} onClick={handleClick}>
        <Icon name="InfoCircle" />
      </IconButton>
    </div>
  );
};
