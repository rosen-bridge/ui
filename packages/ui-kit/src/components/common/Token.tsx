import { HTMLAttributes, useMemo, useState, useEffect, useRef } from 'react';

import { ExternalLinkAlt, TOKENS } from '@rosen-bridge/icons';
import { capitalize } from 'lodash-es';

import { IconButton } from '../base';
import { Avatar } from './Avatar';
import { InjectOverrides } from './InjectOverrides';
import { Stack } from './Stack';
import { SvgIcon } from './SvgIcon';
import { Text } from './Text';
import { Truncate } from './Truncate';

/**
 * Props for the Token component.
 */
export type TokenProps = HTMLAttributes<HTMLDivElement> & {
  /** If provided, renders an external link that opens in a new tab */
  href?: string;

  /**
   * If true, the token is in loading state and shows a skeleton placeholder.
   */
  loading?: boolean;

  /**
   * The name of the token to display.
   */
  name?: string;

  /**
   * If true, show the avatar and text in reverse order.
   */
  reverse?: boolean;

  /**
   * Token id used to resolve icon.
   */
  ergoSideTokenId?: string;

  /**
   * Visual variant.
   */
  variant?: 'both' | 'logo' | 'title';
};

/**
 * Displays a token with an avatar and its name.
 */
const TokenBase = ({
  href,
  loading,
  name = 'Unsupported token',
  reverse,
  style,
  ergoSideTokenId,
  variant = 'both',
}: TokenProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const [isVisible, setIsVisible] = useState(false);

  const ref = useRef<HTMLDivElement | null>(null);

  const url = TOKENS[ergoSideTokenId as keyof typeof TOKENS];

  const isLoading = loading || (!!url && !isLoaded);

  const styles = useMemo(() => {
    return Object.assign(
      {},
      {
        flexDirection: !reverse ? 'row' : 'row-reverse',
        fontSize: 'inherit',
        minWidth: 0,
      },
      style,
    );
  }, [reverse, style]);

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
    <Stack align="center" style={styles} spacing="0.5em" ref={ref}>
      {!!url && isVisible && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          alt={`Token ${name}`}
          src={url}
          loading="lazy"
          style={{
            width: '2em',
            height: '2em',
            borderRadius: '50%',
            objectFit: 'cover',
            opacity: isLoading ? '0' : '1',
            position: isLoading ? 'absolute' : 'static',
            pointerEvents: isLoading ? 'none' : 'auto',
          }}
          onLoad={() => setIsLoaded(true)}
          onError={() => setIsLoaded(true)}
        />
      )}
      {(!url || isLoading) && (
        <Avatar
          background="secondary.light"
          color="secondary"
          loading={isLoading}
          size="2em"
          style={{ fontSize: '1em' }}
        >
          {capitalize(name).slice(0, 1)}
        </Avatar>
      )}
      {(variant === 'both' || variant === 'title') && (
        <Text loading={loading} style={{ fontSize: 'inherit', minWidth: 0 }}>
          <Truncate lines={1}>{name}</Truncate>
        </Text>
      )}
      {!!href && (
        <IconButton target="_blank" size="small" href={href}>
          <SvgIcon size="small">
            <ExternalLinkAlt />
          </SvgIcon>
        </IconButton>
      )}
    </Stack>
  );
};

export const Token = InjectOverrides(TokenBase);
