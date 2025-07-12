'use client';

import React from 'react';

import { Fire, SnowFlake } from '@rosen-bridge/icons';
import {
  Amount2,
  Divider,
  Identifier,
  Network,
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

export type NetworkCardProps = {
  /** Data props for the 'hot' network */
  hot: NetworkProps;

  /** Data props for the 'cold' network */
  cold: NetworkProps;

  /** Network name or identifier to display */
  network: NetworkType;
};

const NetworkContainer = styled('div')(({ theme }) => ({
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
/**
 * NetworkCard component that displays network name,
 * and renders two RenderNetwork components for 'hot' and 'cold' data.
 * @param hot Data props for the 'hot' network.
 * @param cold Data props for the 'cold' network.
 * @param network Network name or identifier to display.
 */
const NetworkCard = ({ hot, cold, network }: NetworkCardProps) => {
  return (
    <NetworkContainer>
      <WrapperItem>
        <Network name={network} />
      </WrapperItem>

      <RenderNetwork {...hot} state={'hot'} />

      <Divider variant="middle" sx={{ width: '100%' }} />

      <RenderNetwork {...cold} state={'cold'} />
    </NetworkContainer>
  );
};
export default NetworkCard;
