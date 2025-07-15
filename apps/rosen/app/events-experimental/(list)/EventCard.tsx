import React from 'react';

import {
  Amount2,
  Avatar,
  Box,
  Chip,
  Connector,
  Identifier,
  Network,
  Skeleton,
  styled,
} from '@rosen-bridge/ui-kit';
import { capitalize } from 'lodash-es';

type EventCardProps = {
  onClick?: () => void;
  item?: any;
  active?: boolean;
  isLoading?: boolean;
};

const Root = styled('div')<{ active?: boolean; isSkeleton?: boolean }>(
  ({ theme, active, isSkeleton }) => ({
    'display': 'flex',
    'flexDirection': 'column',
    'cursor': isSkeleton ? 'default' : 'pointer',
    'pointerEvents': isSkeleton ? 'none' : 'auto',
    'padding': theme.spacing(1.5),
    'border': `3px solid ${active ? theme.palette.primary.main : 'transparent'}`,
    'backgroundColor': theme.palette.background.paper,
    'borderRadius': theme.shape.borderRadius,
    'gap': theme.spacing(1),
    'width': '100%',
    'fontSize': '16px',
  }),
);

const Wrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
}));

const EventSkeleton = () => {
  return (
    <Root
      sx={{
        height: '160px',
      }}
      isSkeleton
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: (theme) => theme.spacing(1),
          padding: (theme) => theme.spacing(0, 0, 2, 0),
        }}
      >
        <Skeleton variant="circular" width={48} height={48} />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: (theme) => theme.spacing(1),
          }}
        >
          <Skeleton variant="rounded" width={80} height={14}></Skeleton>
          <Skeleton variant="rounded" width={60} height={14}></Skeleton>
        </Box>
      </Box>
      <Skeleton variant="rounded" width="100%" height={20}></Skeleton>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: (theme) => theme.spacing(1),
          padding: (theme) => theme.spacing(1, 0, 0, 0),
        }}
      >
        <Skeleton variant="rounded" width={80} height={32}></Skeleton>
        <Skeleton variant="rounded" width={80} height={32}></Skeleton>
      </Box>
    </Root>
  );
};

const Event = ({ onClick, active, item }: EventCardProps) => {
  const { fromChain: from, toChain: to } = item;
  return (
    <Root active={active} onClick={onClick}>
      <Wrapper
        sx={(theme) => ({
          fontSize: theme.typography.body1,
          gap: theme.spacing(1),
        })}
      >
        <Avatar
          sx={(theme) => ({
            backgroundColor: theme.palette.secondary.light,
            color: theme.palette.secondary.main,
          })}
        >
          {capitalize(item.lockToken.name.slice(0, 1))}
        </Avatar>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          <Amount2
            unit={item.lockToken.name}
            value={item.amount}
            orientation={'vertical'}
          />
        </div>
      </Wrapper>

      <Identifier value={item.eventId} href={`/events-experimental/${item.eventId}`} />

      <Wrapper
        sx={(theme) => ({
          justifyContent: 'space-between',
          fontSize: theme.typography.body1,
          width: '100%',
        })}
      >
        <Connector
          variant="filled"
          start={<Network name={from} variant="logo" />}
          end={<Network name={to} variant="logo" />}
        />
        <Chip label={item.status} color="success" icon={'CheckCircle'} />
      </Wrapper>
    </Root>
  );
};

export const EventCard = ({ isLoading, ...props }: EventCardProps) => {
  return !isLoading ? <Event {...props} /> : <EventSkeleton />;
};


