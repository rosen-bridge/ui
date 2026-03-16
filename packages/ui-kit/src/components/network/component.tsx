import { ComponentProps, FC, SVGAttributes, useMemo } from 'react';

import { OverridableType } from '@/@types';
import {
  Icon,
  IconOverriddenProps,
  Skeleton,
  Text,
  TextOverriddenProps,
  Truncate,
} from '@/components';
import { ElementBaseProps, Root, Wrap } from '@/core';

import { Logo } from './logo';
import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
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
  networks?: Record<NonNullable<NetworkOverriddenProps['value']>, NetworkMeta>;

  slots?: {
    label?: TextOverriddenProps;
    logo?: IconOverriddenProps;
  };

  /** The name of the network (like 'binance', 'bitcoin', etc.). Optional, fallback will be used if missing */
  value?: string & {};

  /** What to show */
  variant?: 'both' | 'logo' | 'label' | 'reverse';
};

export type NetworkBaseProps = ElementBaseProps<'div', NetworkOwnProps>;

export type NetworkOverriddenProps = OverridableType<
  NetworkBaseProps,
  NetworkOverrides,
  'value'
>;

const DEFAULT_NETWORK: NetworkMeta = {
  label: 'Unsupported',
  logo: Logo,
};

export const NetworkBase = ({
  fallback,
  loading,
  value = '',
  networks,
  slots,
  variant = 'both',
  ...rest
}: NetworkOverriddenProps) => {
  const showLabel = variant !== 'logo';
  const showLogo = variant !== 'label';

  const { logo: Logo, label } = useMemo(
    () => Object.assign({}, DEFAULT_NETWORK, fallback, networks?.[value]),
    [fallback, networks, value],
  );

  return (
    <Root reflects={{ variant }} {...rest}>
      {showLogo && loading && <Skeleton variant="circular" />}
      <Icon
        className="logo"
        icons={{ [value]: Logo }}
        name={value}
        size="2em"
        skip={!(showLogo && !loading && Logo)}
        {...slots?.logo}
      />
      <Text
        asChild
        className="label"
        loading={loading}
        skip={!showLabel}
        {...slots?.label}
      >
        <Truncate>{label}</Truncate>
      </Text>
    </Root>
  );
};

NetworkBase.displayName = 'Network';

export const Network = Wrap(NetworkBase);

export type NetworkProps = ComponentProps<typeof Network>;
