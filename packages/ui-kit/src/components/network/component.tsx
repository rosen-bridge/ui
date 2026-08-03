import { type FC, type SVGAttributes, useMemo } from 'react';

import {
  Icon,
  type IconProps,
  Typography,
  type TypographyProps,
} from '@/components';
import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

import { Logo } from './logo';

import './styles.css';

export interface NetworkOverrides {}

export type NetworkMeta = {
  label: string;
  logo: FC<SVGAttributes<SVGElement>>;
};

export type NetworkOwnProps = {
  /** Fallback when network is not found */
  fallback?: NetworkMeta;

  /** If true, show loading placeholders */
  loading?: boolean;

  /** Static registry */
  networks?: Record<NonNullable<NetworkProps['value']>, NetworkMeta>;

  slots?: {
    label?: TypographyProps;
    logo?: IconProps;
  };

  /** The name of the network (like 'binance', 'bitcoin', etc.). Optional, fallback will be used if missing */
  value?: string & {};

  /** What to show */
  variant?: 'both' | 'logo' | 'label' | 'reverse';
};

export type NetworkBaseProps = ElementBaseProps<'div', NetworkOwnProps>;

export type NetworkProps = OverridableType<
  NetworkBaseProps,
  NetworkOverrides,
  'value'
>;

const DEFAULT_NETWORK: NetworkMeta = {
  label: 'Unsupported',
  logo: Logo,
};

export const Network = (props: NetworkProps) => {
  const {
    fallback,
    loading,
    value = '',
    networks,
    slots,
    variant = 'both',
    ...rest
  } = useConfig('Network', props);

  const showLabel = variant !== 'logo';

  const showLogo = variant !== 'label';

  const { logo: Logo, label } = useMemo(
    () => Object.assign({}, DEFAULT_NETWORK, fallback, networks?.[value]),
    [fallback, networks, value],
  );

  return (
    <div data-variant={variant} {...rest}>
      {showLogo && Logo && (
        <Icon
          as={Logo}
          className="RosenNetwork-logo"
          loading={loading}
          size="2em"
          {...slots?.logo}
        />
      )}
      {showLabel && (
        <Typography
          className="RosenNetwork-label"
          component="div"
          loading={loading}
          noWrap
          variant="inherit"
          {...slots?.label}
        >
          {label}
        </Typography>
      )}
    </div>
  );
};

Network.displayName = 'Network';
