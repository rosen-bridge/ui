import React, { HTMLAttributes } from 'react';

import { capitalize } from 'lodash-es';

import { Typography, Stack, Skeleton } from '../base';
import { Avatar } from './Avatar';
import { InjectOverrides } from './InjectOverrides';

/**
 * Props for the Token component.
 */
export type TokenProps = HTMLAttributes<HTMLDivElement> & {
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

const Loading = ({ reverse }: TokenProps) => {
  return (
    <Stack
      alignItems="center"
      flexDirection={!reverse ? 'row' : 'row-reverse'}
      fontSize="inherit"
      gap="0.5em"
    >
      <Skeleton width="2em" height="2em" variant="circular" />
      <Skeleton width={80} height={14} variant="rounded" />
    </Stack>
  );
};

/**
 * Displays a token with an avatar and its name.
 *
 * @param loading - If true, show a loading state instead of the token content.
 * @param name - The name of the token to display.
 * @param reverse - If true, show items in reverse order.
 */
const TokenBase = ({ loading, name, reverse }: TokenProps) => {
  if (loading) {
    return <Loading reverse={reverse} />;
  }

  return (
    <Stack
      component="div"
      alignItems="center"
      flexDirection={!reverse ? 'row' : 'row-reverse'}
      fontSize="inherit"
      gap="0.5em"
    >
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

      <Stack flexDirection="column" alignItems="start">
        <Typography sx={{ fontSize: 'inherit' }}>{name}</Typography>
      </Stack>
    </Stack>
  );
};

export const Token = InjectOverrides(TokenBase);
