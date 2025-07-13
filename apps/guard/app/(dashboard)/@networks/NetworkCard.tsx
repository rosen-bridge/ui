'use client';

import React from 'react';

import { Fire, SnowFlake } from '@rosen-bridge/icons';
import {
  Amount2,
  Divider,
  Identifier,
  Network,
  Skeleton,
  styled,
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

const Root = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'start',
  backgroundColor: theme.palette.background.paper,
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(2, 2, 1, 2),
  borderRadius: theme.shape.borderRadius,
}));

const WrapperItem = styled('div')(({ theme }) => ({
  width: '100%',
}));

const WrapperIcon = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'start',
  gap: '0.5rem',
  fontSize: '1.5rem',
  width: '100%',
}));

const WrapperFallBack = styled('div')(({ theme }) => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const RenderNetwork = ({
  amount,
  unit,
  address,
  state,
  link,
}: RenderNetworkProps) => {
  return (
    <WrapperItem>
      <WrapperIcon>
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
          sx={{
            fontWeight: 700,
            fontSize: '1.5rem',
            color: (theme) =>
              state === 'hot'
                ? theme.palette.secondary.dark
                : theme.palette.tertiary.dark,
          }}
        >
          <Amount2 value={amount} unit={unit} />
        </Typography>
      </WrapperIcon>
      <Identifier value={address} qrcode href={link} />
    </WrapperItem>
  );
};

const NetworkCardSkeleton = () => {
  return (
    <Root>
      <WrapperItem>
        <WrapperIcon>
          <Skeleton variant="circular" width={24} height={24} />
          <Skeleton variant="text" width={80} height={32} />
        </WrapperIcon>
      </WrapperItem>

      <WrapperItem>
        <WrapperIcon>
          <Skeleton variant="circular" width={24} height={24} />
          <Skeleton variant="text" width={120} height={32} />
        </WrapperIcon>
        <Skeleton variant="text" width="100%" height={32} />
      </WrapperItem>

      <Divider variant="middle" sx={{ width: '100%' }} />

      <WrapperItem>
        <WrapperIcon>
          <Skeleton variant="circular" width={24} height={24} />
          <Skeleton variant="text" width={120} height={32} />
        </WrapperIcon>
        <Skeleton variant="text" width="100%" height={32} />
      </WrapperItem>
    </Root>
  );
};

const NetworkFallback = () => {
  return (
    <Root sx={{ height: '100%' }}>
      <WrapperFallBack>
        <Typography variant="body1" color="error">
          Some required data is missing.
        </Typography>
      </WrapperFallBack>
    </Root>
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
    <Root>
      <WrapperItem>
        <Network name={network} />
      </WrapperItem>

      <RenderNetwork {...hot} state={'hot'} />

      <Divider variant="middle" sx={{ width: '100%' }} />

      <RenderNetwork {...cold} state={'cold'} />
    </Root>
  );
};
