import { ComponentProps, FC, SVGAttributes, useMemo } from 'react';
import { ElementBaseProps, Root, Wrap } from '../../core';
import { OverridableType } from '../../@types';
import { Skeleton } from '../base';
import { Logo } from './logo';
import { Truncate } from '../truncate';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NetworkOverrides { }

export type NetworkMeta = {
  label: string;
  logo: FC<SVGAttributes<SVGElement>>;
};

export type NetworkOwnProps = {
  /** Fallback when network is not found */
  fallback?: NetworkMeta;

  /** If true, show loading placeholders */
  loading?: boolean;

  /** The name of the network (like 'binance', 'bitcoin', etc.). Optional, fallback will be used if missing */
  name?: string & {};

  /** Static registry */
  networks?: Record<NonNullable<NetworkOverriddenProps['name']>, NetworkMeta>;

  /** What to show */
  variant?: 'both' | 'logo' | 'label' | 'reverse';
};

export type NetworkBaseProps = ElementBaseProps<'div', NetworkOwnProps>;

export type NetworkOverriddenProps = OverridableType<
  NetworkBaseProps,
  NetworkOverrides,
  'name'
>;

const DEFAULT_NETWORK: NetworkMeta = {
  label: 'Unsupported',
  logo: Logo
};

export const NetworkBase = ({ fallback, loading, name = '', networks, variant = 'both', ...rest }: NetworkOverriddenProps) => {
  const showLabel = variant !== 'logo';
  const showLogo = variant !== 'label';

  const { logo: Logo, label } = useMemo(() => Object.assign({}, DEFAULT_NETWORK, fallback, networks?.[name]), [fallback, name, networks]);

  return (
    <Root reflects={{ variant }} {...rest}>
      {showLogo && loading && (
        <Skeleton variant="circular" />
      )}
      {showLogo && !loading && Logo && (
        <Logo />
      )}
      {showLabel && loading && (
        <Skeleton width={60} />
      )}
      {showLabel && !loading && (
        <Truncate className="label">{label}</Truncate>
      )}
    </Root>
  )
};

NetworkBase.displayName = 'Network';

export const Network = Wrap(NetworkBase);

export type NetworkProps = ComponentProps<typeof Network>;
