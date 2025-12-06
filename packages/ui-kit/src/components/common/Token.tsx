import { HTMLAttributes, useMemo } from 'react';

import { ExternalLinkAlt } from '@rosen-bridge/icons';
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
};

/**
 * Displays a token with an avatar and its name.
 */
const TokenBase = ({ href, loading, name, reverse, style }: TokenProps) => {
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
  return (
    <Stack align="center" style={styles} spacing="0.5em">
      <Avatar
        background="secondary.light"
        color="secondary"
        loading={loading}
        size="2em"
        style={{ fontSize: '1em' }}
      >
        {capitalize(name).slice(0, 1)}
      </Avatar>

      <Text loading={loading} style={{ fontSize: 'inherit', minWidth: 0 }}>
        <Truncate lines={1}>{name}</Truncate>
      </Text>
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
