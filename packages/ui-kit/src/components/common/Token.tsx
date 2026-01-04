import {
  HTMLAttributes,
  Suspense,
  useMemo,
  useState,
  useEffect,
  useRef,
} from 'react';

import { ExternalLinkAlt } from '@rosen-bridge/icons';
import * as ICONS from '@rosen-bridge/icons';
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
  tokenId?: string;

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
  name,
  reverse,
  style,
  tokenId,
  variant = 'both',
}: TokenProps) => {
  const [isIntersecting, setIsIntersecting] = useState(false);

  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      entry.isIntersecting && setIsIntersecting(entry.isIntersecting);
    }, {});

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

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

  const Icon = useMemo(() => {
    if (!tokenId) return;

    const key = Object.keys(ICONS).find((key) => key.includes(tokenId));

    if (!key) return;

    return ICONS[key as keyof typeof ICONS];
  }, [tokenId]);

  return (
    <Stack align="center" style={styles} spacing="0.5em" ref={ref}>
      {Icon && isIntersecting && (
        <Suspense
          fallback={<Avatar loading size="2em" style={{ fontSize: '1em' }} />}
        >
          <Icon style={{ width: '2em', height: '2em' }} />
        </Suspense>
      )}
      {(!Icon || !isIntersecting) && (
        <Avatar
          background="secondary.light"
          color="secondary"
          loading={loading || !isIntersecting}
          size="2em"
          style={{ fontSize: '1em' }}
        >
          {capitalize(name).slice(0, 1)}
        </Avatar>
      )}
      {(variant === 'both' || variant == 'title') && (
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
