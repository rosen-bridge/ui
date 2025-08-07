import React from 'react';

import { capitalize } from 'lodash-es';

import { Typography, Avatar, Stack } from '../base';

/**
 * Props for the Token component.
 * @property name - The token's name.
 * @property reverse - If true, show items in reverse order.
 */
type TokenProps = {
  name?: string;
  reverse?: boolean;
};

/**
 * Displays a token with an avatar and its name.
 *
 * @param name - The name of the token.
 * @param reverse - If true, show items in reverse order.
 */
export const Token = ({ name, reverse }: TokenProps) => {
  return (
    <Stack
      alignItems="center"
      flexDirection={!reverse ? 'row' : 'row-reverse'}
      fontSize="inherit"
      gap="0.5em"
    >
      <Avatar
        sx={(theme) => ({
          width: '2em ',
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
