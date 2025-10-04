import { HTMLAttributes } from 'react';

import { Search } from '@rosen-bridge/icons';

import { styled } from '../../styling';
import { SvgIconMui, Typography } from '../base';

const Root = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1),
}));
const IconWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '88px',
  height: '88px',
  backgroundColor: theme.palette.primary.light,
  borderRadius: '50%',
  opacity: 0.5,
}));
const SearchCircle = styled('div')(({ theme }) => ({
  'position': 'relative',
  'display': 'flex',
  'alignItems': 'center',
  'justifyContent': 'center',
  '& > svg': {
    width: '40px',
    height: '40px',
    color: theme.palette.primary.main,
  },
}));
const CountBadge = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: -10,
  right: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  width: '23px',
  height: '26px',
  backgroundColor: theme.palette.primary.main,
  borderRadius: '50%',
  cursor: 'default',
  border: `2px solid ${theme.palette.info.light}`,
}));

export type EmptyStateProps = {} & HTMLAttributes<HTMLDivElement>;

/**
 * `EmptyState` is a reusable UI component that displays
 * a friendly message and an icon when there are no results to show.
 *
 * This component is typically used for empty search states,
 * filter results, or empty lists.
 *
 * Structure:
 * - A circular search icon with a badge showing zero results.
 * - A main message (`No results found!`).
 * - A helper message suggesting the user to adjust filters.
 *
 * This component does not accept props and is fully static.
 */
export const EmptyState = (props: EmptyStateProps) => {
  return (
    <Root {...props}>
      <IconWrapper>
        <SearchCircle>
          <SvgIconMui>
            <Search />
          </SvgIconMui>
          <CountBadge>
            <Typography
              typography="span"
              variant="body2"
              color={'background.paper'}
            >
              0
            </Typography>
          </CountBadge>
        </SearchCircle>
      </IconWrapper>
      <Typography variant="body1">No results found!</Typography>
      <Typography variant="body2">Adjust your filter and try again.</Typography>
    </Root>
  );
};
