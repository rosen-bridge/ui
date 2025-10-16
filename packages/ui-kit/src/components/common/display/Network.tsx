import { SvgIcon } from '@mui/material';
import * as Icons from '@rosen-bridge/icons';
import { NETWORKS } from '@rosen-ui/constants';
import { Network as NetworkType } from '@rosen-ui/types';
import { camelCase, upperFirst } from 'lodash-es';

import { styled } from '../../../styling';
import { Skeleton, Typography } from '../../base';
import { InjectOverrides } from '../InjectOverrides';

export type NetworkProps = {
  /** Layout orientation: 'horizontal' | 'vertical' */
  orientation?: 'horizontal' | 'vertical';

  /** If true, show loading placeholders */
  loading?: boolean;

  /** The name of the network (like 'binance', 'bitcoin', etc.). Optional, fallback will be used if missing */
  name?: NetworkType;

  /** If true, reverse the order */
  reverse?: boolean;

  /** What to show: 'both' | 'logo' | 'title' */
  variant?: 'both' | 'logo' | 'title';
};

const Root = styled('div')<NetworkProps>(({ reverse, orientation }) => {
  let flexDirection: 'row' | 'row-reverse' | 'column' | 'column-reverse' =
    'row';

  if (orientation === 'vertical') {
    flexDirection = reverse ? 'column-reverse' : 'column';
  } else {
    flexDirection = reverse ? 'row-reverse' : 'row';
  }

  return {
    display: 'flex',
    width: 'fit-content',
    alignItems: 'center',
    fontSize: 'inherit',
    flexDirection,
    gap: '0.5em',
  };
});

/**
 * Skeleton placeholder for the Network component.
 */
const NetworkSkeleton = ({
  orientation,
  reverse,
  showText,
  showIcon,
}: Omit<NetworkProps, 'name'> & { showIcon?: boolean; showText?: boolean }) => (
  <Root reverse={reverse} orientation={orientation}>
    {showIcon && (
      <Skeleton
        animation="wave"
        sx={{ width: '2em', height: '2em' }}
        variant="circular"
      />
    )}
    {showText && (
      <Skeleton
        animation="wave"
        height={14}
        width={60}
        variant="rectangular"
        sx={{ borderRadius: 0.3 }}
      />
    )}
  </Root>
);

/**
 * Fallback for unsupported networks.
 */
const NetworkFallback = ({
  orientation,
  reverse,
  showText,
  showIcon,
}: Omit<NetworkProps, 'name'> & { showIcon?: boolean; showText?: boolean }) => (
  <Root reverse={reverse} orientation={orientation}>
    {showIcon && (
      <SvgIcon sx={{ fontSize: '2em' }}>
        <Icons.ExclamationTriangleFill
          style={{ width: '100%', height: '100%' }}
        />
      </SvgIcon>
    )}
    {showText && <Typography variant="body1">Unsupported</Typography>}
  </Root>
);

/**
 * Main Network component.
 */
const NetworkBase = ({
  name,
  variant = 'both',
  orientation = 'horizontal',
  loading,
  reverse,
}: NetworkProps) => {
  const showText = variant !== 'logo';
  const showIcon = variant !== 'title';

  if (loading) {
    return (
      <NetworkSkeleton
        showText={showText}
        showIcon={showIcon}
        orientation={orientation}
        reverse={reverse}
      />
    );
  }

  if (!name) {
    return (
      <NetworkFallback
        showText={showText}
        showIcon={showIcon}
        orientation={orientation}
        reverse={reverse}
      />
    );
  }

  const network = name in NETWORKS ? NETWORKS[name as NetworkType] : undefined;
  const iconKey = upperFirst(camelCase(name));
  const LogoNetwork =
    iconKey in Icons ? Icons[iconKey as keyof typeof Icons] : undefined;

  if (!network || !LogoNetwork) {
    return (
      <NetworkFallback
        showText={showText}
        showIcon={showIcon}
        orientation={orientation}
        reverse={reverse}
      />
    );
  }

  return (
    <Root reverse={reverse} orientation={orientation}>
      {showIcon && (
        <SvgIcon sx={{ fontSize: '2em' }}>
          <LogoNetwork style={{ width: '100%', height: '100%' }} />
        </SvgIcon>
      )}
      {showText && <Typography variant="inherit">{network.label}</Typography>}
    </Root>
  );
};

export const Network = InjectOverrides(NetworkBase);
