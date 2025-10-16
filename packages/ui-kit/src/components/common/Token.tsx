import React, { HTMLAttributes } from 'react';

import { SvgIcon, Stack, Tooltip } from '@mui/material';
import { ExternalLinkAlt } from '@rosen-bridge/icons';
import { capitalize } from 'lodash-es';

import { Typography, Skeleton, IconButton, Box } from '../base';
import { Avatar } from './Avatar';
import { InjectOverrides } from './InjectOverrides';

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
      alignItems="center"
      flexDirection={!reverse ? 'row' : 'row-reverse'}
      fontSize="inherit"
      gap="0.5em"
      overflow="hidden"
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
          <Tooltip title={name} enterDelay={500}>
            <Typography sx={{ fontSize: 'inherit' }} noWrap>
              {name}
            </Typography>
          </Tooltip>
          {!!href && (
            <Box ml={reverse ? 0 : -1} mr={reverse ? -1 : 0}>
              <IconButton target="_blank" size="small" href={href}>
                <SvgIcon fontSize="small">
                  <ExternalLinkAlt />
                </SvgIcon>
              </IconButton>
            </Box>
          )}
        </>
      )}
    </Stack>
  );
};

export const Token = InjectOverrides(TokenBase);
