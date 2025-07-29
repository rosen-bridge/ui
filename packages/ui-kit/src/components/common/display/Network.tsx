import * as Icons from '@rosen-bridge/icons';
import { NETWORKS } from '@rosen-ui/constants';
import { Network as NetworkType } from '@rosen-ui/types';
import { capitalize } from 'lodash-es';

import { styled } from '../../../styling';
import { Skeleton, SvgIcon, Typography } from '../../base';

/**
 * Props for the Network component.
 *
 * @property name - The name of the network (like 'binance', 'bitcoin', etc.).
 * @property variant - What to show:
 *   - 'both': logo + label (default)
 *   - 'logo': logo only
 *   - 'title': label only
 * @property orientation - 'horizontal' or 'vertical'.
 * @property loading - If true, show loading placeholders.
 * @property reverse - If true, reverse order.
 */
export type NetworkProps = {
  name: NetworkType;
  variant?: 'both' | 'logo' | 'title';
  orientation?: 'horizontal' | 'vertical';
  loading?: boolean;
  reverse?: boolean;
};

const Root = styled('div')<Omit<NetworkProps, 'name'>>(({
  theme,
  reverse,
  orientation,
}) => {
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
    flexDirection,
    gap: theme.spacing(1),
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
      <Skeleton animation="wave" height={24} width={24} variant="circular" />
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
      <SvgIcon>
        <Icons.ExclamationTriangleFill />
      </SvgIcon>
    )}
    {showText && <Typography variant="body1">Unsupported</Typography>}
  </Root>
);

/**
 * Main Network component.
 */
export const Network = ({
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

  const network = name in NETWORKS ? NETWORKS[name as NetworkType] : undefined;

  const iconKey = capitalize(name);

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
        <SvgIcon>
          <LogoNetwork />
        </SvgIcon>
      )}
      {showText && <Typography variant="body1">{network.label}</Typography>}
    </Root>
  );
};
