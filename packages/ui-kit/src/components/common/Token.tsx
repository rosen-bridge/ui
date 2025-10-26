import React, { HTMLAttributes } from 'react';

import { ExternalLinkAlt } from '@rosen-bridge/icons';
import { capitalize } from 'lodash-es';

import { Typography, Skeleton, IconButton } from '../base';
import { Avatar } from './Avatar';
import { InjectOverrides } from './InjectOverrides';
import { Stack } from './Stack';
import { SvgIcon } from './SvgIcon';

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
const TokenBase = ({ href, loading, name, reverse }: TokenProps) => {
  return (
    <Stack
      align="center"
      style={{
        flexDirection: !reverse ? 'row' : 'row-reverse',
        fontSize: 'inherit',
      }}
      spacing="0.5em"
    >
      {loading ? (
        <>
          <Skeleton width="2em" height="2em" variant="circular" />
          <Skeleton width={80} height={14} variant="rounded" />
        </>
      ) : (
        <>
          <Avatar
            sx={(theme) => ({
              width: '2em',
              height: '2em',
              fontSize: '1em',
              backgroundColor: theme.palette.secondary.light,
              color: theme.palette.secondary.main,
            })}
          >
            {capitalize(name).slice(0, 1)}
          </Avatar>

          <Stack direction="column" align="start">
            <Typography sx={{ fontSize: 'inherit' }}>{name}</Typography>
          </Stack>
          {!!href && (
            <IconButton target="_blank" size="small" href={href}>
              <SvgIcon size="small">
                <ExternalLinkAlt />
              </SvgIcon>
            </IconButton>
          )}
        </>
      )}
    </Stack>
  );
};

export const Token = InjectOverrides(TokenBase);
