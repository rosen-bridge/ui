import { useEffect, useMemo, useRef, useState } from 'react';

import {
  Avatar,
  AvatarProps,
  Icon,
  IconButton,
  Image,
  ImageProps,
  Typography,
  TypographyProps,
} from '@/components';
import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType } from '@/types';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TokenOverrides {}

export type TokenMeta = {
  label: string;
  logo?: string;
};

export type TokenOwnProps = {
  /** Fallback when token is not found */
  fallback?: TokenMeta;

  /** If provided, renders an external link that opens in a new tab */
  href?: string;

  label?: string;

  /**
   * If true, the token is in loading state and shows a skeleton placeholder.
   */
  loading?: boolean;

  logo?: string;

  slots?: {
    fallback?: AvatarProps;
    label?: TypographyProps;
    logo?: ImageProps;
  };

  /** Static registry */
  tokens?: Record<NonNullable<TokenProps['value']>, TokenMeta>;

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

export type TokenProps = OverridableType<
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
  label,
  loading,
  logo,
  slots,
  tokens,
  value = '',
  variant = 'both',
  ...rest
}: TokenProps) => {
  const showLabel = variant !== 'logo';
  const showLogo = variant !== 'label';

  const [isLoaded, setIsLoaded] = useState(false);

  const [isVisible, setIsVisible] = useState(false);

  const ref = useRef<HTMLDivElement | null>(null);

  const resolved = useMemo(
    () => Object.assign({}, DEFAULT_NETWORK, fallback, tokens?.[value]),
    [fallback, tokens, value],
  );

  const displayLabel = label || resolved.label;

  const displayLogo = logo || resolved.logo;

  const isLoading = loading || (!!displayLogo && !isLoaded);

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
    <div data-variant={variant} {...rest} ref={ref}>
      {showLogo && !!displayLogo && isVisible && (
        <Image
          alt={`Token ${displayLabel}`}
          src={displayLogo}
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
      {showLogo && (!displayLogo || isLoading) && (
        <Avatar
          background="secondary-light"
          color="secondary"
          loading={isLoading}
          size="2em"
          style={{ fontSize: '1em' }}
          {...slots?.fallback}
        >
          {displayLabel?.at(0)?.toUpperCase()}
        </Avatar>
      )}
      {showLabel && (
        <Typography
          component="div"
          loading={loading}
          noWrap
          variant="inherit"
          style={{ minWidth: 0 }}
          {...slots?.label}
        >
          {displayLabel}
        </Typography>
      )}
      {!!href && (
        <IconButton target="_blank" size="small" href={href}>
          <Icon name="ExternalLinkAlt" size="small" />
        </IconButton>
      )}
    </div>
  );
};

TokenBase.displayName = 'Token';

export const Token = Wrap(TokenBase);
