'use client';

import React from 'react';

import { Fire, SnowFlake } from '@rosen-bridge/icons';
import {
  Amount,
  Divider,
  Identifier,
  Network,
  Skeleton,
  Stack,
  SvgIcon,
  Typography,
} from '@rosen-bridge/ui-kit';
import { Network as NetworkType } from '@rosen-ui/types';

export type NetworkProps = {
  /** The numeric amount of the asset */
  amount: number;

  /** The unit symbol or name of the asset (e.g., 'ERG') */
  unit: string;

  /** URL or href associated with this network item */
  link: string;

  /** The network address or identifier string */
  address: string;
};

type RenderNetworkProps = NetworkProps & {
  /** Visual state that affects icon and colors. Must be either 'hot' or 'cold' */
  state: 'hot' | 'cold';
};

/**
 * Props for the `NetworkCard` component.
 *
 * @property hot - Data for the 'hot' network, including amount, unit, link, and address.
 * @property cold - Data for the 'cold' network, including amount, unit, link, and address.
 * @property network - The network name or identifier to display. Required.
 * @property isLoading - If `true`, shows a skeleton placeholder instead of actual content.
 */
export type NetworkCardProps = {
  /** Data for the 'hot' network (e.g., current wallet info). */
  hot?: NetworkProps;

  /** Data for the 'cold' network (e.g., cold wallet info). */
  cold?: NetworkProps;

  /** The network name or identifier to display (e.g., 'Binance'). */
  network?: NetworkType;

  /** Shows a loading skeleton while data is being fetched. */
  isLoading?: boolean;
};

const RenderNetwork = ({
  amount,
  unit,
  address,
  state,
  link,
}: RenderNetworkProps) => {
  return (
    <div style={{ width: '100%' }}>
      <Stack
        gap={1}
        fontSize="1.5rem"
        flexDirection="row"
        alignItems="center"
        justifyContent="start"
        width="100%"
      >
        <SvgIcon
          sx={{
            color: (theme) =>
              state === 'hot'
                ? theme.palette.secondary.dark
                : theme.palette.tertiary.dark,
          }}
        >
          {state === 'hot' ? <Fire /> : <SnowFlake />}
        </SvgIcon>
        <Typography
          component="div"
          sx={{
            fontWeight: 700,
            fontSize: '1.5rem',
            color: (theme) =>
              state === 'hot'
                ? theme.palette.secondary.dark
                : theme.palette.tertiary.dark,
          }}
        >
          <Amount value={amount} unit={unit} />
        </Typography>
      </Stack>
      <Identifier value={address} qrcode href={link} />
    </div>
  );
};

const NetworkCardSkeleton = () => {
  return (
    <Stack
      alignItems="center"
      bgcolor="background.paper"
      sx={{ borderRadius: (theme) => theme.spacing(2) }}
      flexDirection="column"
      gap={1}
      justifyContent="start"
      padding={[2, 2, 1, 2]}
      width="100%"
    >
      <Stack
        gap={1}
        flexDirection="row"
        alignItems="center"
        justifyContent="start"
        width="100%"
      >
        <Skeleton variant="circular" width={24} height={24} />
        <Skeleton variant="text" width={80} height={32} />
      </Stack>

      <Stack width="100%" justifyContent="start">
        <Stack
          gap={1}
          flexDirection="row"
          alignItems="center"
          justifyContent="start"
          width="100%"
        >
          <Skeleton variant="circular" width={24} height={24} />
          <Skeleton variant="text" width={120} height={32} />
        </Stack>
        <Skeleton variant="text" width="100%" height={32} />
      </Stack>

      <Divider variant="middle" style={{ width: '100%' }} />

      <Stack width="100%">
        <Stack
          gap={1}
          flexDirection="row"
          alignItems="center"
          justifyContent="start"
          width="100%"
        >
          <Skeleton variant="circular" width={24} height={24} />
          <Skeleton variant="text" width={120} height={32} />
        </Stack>
        <Skeleton variant="text" width="100%" height={32} />
      </Stack>
    </Stack>
  );
};

const NetworkFallback = () => {
  return (
    <Stack
      alignItems="center"
      bgcolor="background.paper"
      sx={{ borderRadius: (theme) => theme.spacing(2) }}
      flexDirection="column"
      gap={1}
      justifyContent="start"
      padding={[2, 2, 1, 2]}
      width="100%"
      height='100%'
    >
      <Stack alignItems="center" justifyContent="center">
        <Typography variant="body1" color="error">
          Some required data is missing.
        </Typography>
      </Stack>
    </Stack>
  );
};

/**
 * `NetworkCard` displays network information for two states (`hot` and `cold`)
 * with icons, amounts, addresses, and QR code. If `isLoading` is `true`, it shows
 * a skeleton placeholder. If required `network` data is missing, it falls back
 * to an error message.
 *
 * @example
 * ```tsx
 * <NetworkCard
 *   network="Binance"
 *   hot={{ amount: 3022, unit: 'ERG', link: '', address: 'xyz' }}
 *   cold={{ amount: 1234, unit: 'ERG', link: '', address: 'abc' }}
 *   isLoading={false}
 * />
 * ```
 *
 * @param props - {@link NetworkCardProps}
 * @returns Rendered JSX for the network card.
 */
export const NetworkCard = ({
  hot,
  cold,
  network,
  isLoading,
}: NetworkCardProps) => {
  if (isLoading) {
    return <NetworkCardSkeleton />;
  }

  if (!network || !cold || !hot) {
    return <NetworkFallback />;
  }

  return (
    <Stack
      alignItems="center"
      bgcolor="background.paper"
      sx={{ borderRadius: (theme) => theme.spacing(2) }}
      flexDirection="column"
      gap={1}
      justifyContent="start"
      padding={[2, 2, 1, 2]}
      width="100%"
    >
      <div style={{ width: '100%' }}>
        <Network name={network} />
      </div>

      <RenderNetwork {...hot} state={'hot'} />

      <Divider variant="middle" style={{ width: '100%' }} />

      <RenderNetwork {...cold} state={'cold'} />
    </Stack>
  );
};
