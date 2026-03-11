import { ComponentProps, useEffect, useMemo, useRef, useState } from 'react';

import { OverridableType } from '@/@types';
import { ElementBaseProps, Root, Wrap } from '@/core';

import './styles.scss';
import { IconButton } from '../iconButton';
import { Icon } from '../icon';
import { Truncate } from '../truncate';
import { Avatar, AvatarOverriddenProps } from '../avatar';
import { Text } from '../text';
import { Image, ImageOverriddenProps } from '../image';
import { capitalize } from 'lodash-es';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TokenOverrides { }

export type TokenMeta = {
  label: string;
  logo?: string;
};

export type TokenOwnProps = {
  /** Fallback when token is not found */
  fallback?: TokenMeta;

  /** If provided, renders an external link that opens in a new tab */
  href?: string;

  /**
   * If true, the token is in loading state and shows a skeleton placeholder.
   */
  loading?: boolean;

  slots?: {
    fallback?: AvatarOverriddenProps;
    logo?: ImageOverriddenProps;
  };

  /** Static registry */
  tokens?: Record<NonNullable<TokenOverriddenProps['value']>, TokenMeta>;

  /**
   * The name of the token to display.
   */
  value?: string & {};

  /**
   * Visual variant.
   */
  variant?: 'both' | 'logo' | 'label' | 'reverse';
};

export type TokenBaseProps = ElementBaseProps<'div', TokenOwnProps>;

export type TokenOverriddenProps = OverridableType<
  TokenBaseProps,
  TokenOverrides,
  'value'
>;

const DEFAULT_NETWORK: TokenMeta = {
  label: 'Unsupported token',
  logo: '',
};

/**
 * Displays a token with an avatar and its name.
 */
export const TokenBase = ({
  fallback,
  href,
  loading,
  slots,
  style,
  tokens,
  value = '',
  variant = 'both',
  ...rest
}: TokenOverriddenProps) => {
  const showLabel = variant !== 'logo';
  const showLogo = variant !== 'label';

  const [isLoaded, setIsLoaded] = useState(false);

  const [isVisible, setIsVisible] = useState(false);

  const ref = useRef<HTMLDivElement | null>(null);

  const { logo: url, label } = useMemo(
    () => Object.assign({}, DEFAULT_NETWORK, fallback, tokens?.[value]),
    [fallback, tokens, value],
  );

  const isLoading = loading || (!!url && !isLoaded);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        setIsVisible(true);

        observer.disconnect();
      },
      { threshold: 0.1 },
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  return (
    <Root reflects={{ variant }} {...rest} ref={ref}>
      {showLogo && !!url && isVisible && (
        <Image
          alt={`Token ${label}`}
          src={url}
          loading="lazy"
          width={40}
          height={40}
          style={{
            width: '2em',
            height: '2em',
            borderRadius: '50%',
            objectFit: 'cover',
            opacity: isLoading ? '0' : '1',
            position: isLoading ? 'absolute' : 'static',
            pointerEvents: isLoading ? 'none' : 'auto',
            background: 'rgb(245, 245, 245)',
            padding: '2px',
          }}
          onLoad={() => setIsLoaded(true)}
          onError={() => setIsLoaded(true)}
          {...slots?.logo}
        />
      )}
      {showLogo && (!url || isLoading) && (
        <Avatar
          background="secondary-light"
          color="secondary"
          loading={isLoading}
          size="2em"
          style={{ fontSize: '1em' }}
          {...slots?.fallback}
        >
          {capitalize(label).slice(0, 1)}
        </Avatar>
      )}
      {showLabel && (
        <Text loading={loading} style={{ fontSize: 'inherit', minWidth: 0 }}>
          <Truncate>{label}</Truncate>
        </Text>
      )}
      {!!href && (
        <IconButton target="_blank" size="small" href={href}>
          <Icon name="ExternalLinkAlt" size="medium" />
        </IconButton>
      )}
    </Root>
  );
};

TokenBase.displayName = 'Token';

export const Token = Wrap(TokenBase);

export type TokenProps = ComponentProps<typeof Token>;
