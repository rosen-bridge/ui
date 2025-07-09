import * as Icons from '@rosen-bridge/icons';
import { NETWORKS } from '@rosen-ui/constants';
import { Network as NetworkType } from '@rosen-ui/types';
import { capitalize } from 'lodash-es';

import { styled } from '../../../styling';
import { Skeleton, SvgIcon, Typography } from '../../base';

/**
 * Props for the Network component.
 *
 * @property name - The name of the network (like 'binance' or 'bitcoin' and others...).
 *
 * @property variant - What to show:
 * - 'both': show logo and label (default)
 * - 'logo': show only the logo
 * - 'title': show only the label
 *
 * @property orientation - Layout direction:
 * - 'horizontal': items are in a row (default)
 * - 'vertical': items are in a column
 *
 * @property loading - If true, show loading placeholders instead of content.
 *
 * @property reverse - If true, show items in reverse order.
 */
export interface NetworkProps {
  name: NetworkType;
  variant?: 'both' | 'logo' | 'title';
  orientation?: 'horizontal' | 'vertical';
  loading?: boolean;
  reverse?: boolean;
}

interface ContainerNetworkProps {
  reverse?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

const ContainerNetwork = styled('div')<ContainerNetworkProps>(({
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
 * Network component.
 *
 * Shows a network logo and an optional label.
 * You can choose to show only the logo, only the label, or both.
 * The layout can be horizontal or vertical, and you can reverse the order.
 * If `loading` is true, it shows skeleton placeholders.
 *
 * @param props - The props to control how the network is shown.
 */
export const Network = ({
  name,
  variant = 'both',
  orientation = 'horizontal',
  loading,
  reverse,
}: NetworkProps) => {
  const network = NETWORKS[name];

  const LogoNetwork = Icons[capitalize(name) as keyof typeof Icons];

  const showText = variant !== 'logo';

  const showIcon = variant !== 'title';

  return (
    <ContainerNetwork reverse={reverse} orientation={orientation}>
      {showIcon &&
        (loading ? (
          <Skeleton
            animation="wave"
            height={24}
            width={24}
            variant="circular"
          />
        ) : (
          <SvgIcon>
            <LogoNetwork />
          </SvgIcon>
        ))}

      {showText &&
        (loading ? (
          <Skeleton
            animation="wave"
            height={14}
            width={60}
            variant="rectangular"
            sx={{ borderRadius: 0.3 }}
          />
        ) : (
          <Typography variant="body1">{network.label}</Typography>
        ))}
    </ContainerNetwork>
  );
};
