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
import { Network as NetworkType } from '@rosen-ui/types';
import { capitalize } from 'lodash-es';

export type DataContainerProps = {
  variant?: 'grid' | 'row';
  bordered?: boolean;
};

type EventCardProps = {
  onClick?: () => void;
  item?: any;
  active?: boolean;
  variant?: 'grid' | 'row';
  isLoading?: boolean;
};

const DataCard = styled('div')<DataContainerProps>(
  ({ theme, bordered, variant }) => ({
    display: 'flex',
    flexDirection: variant === 'row' ? 'row' : 'column',
    padding: theme.spacing(1.5),
    border: `3px solid ${bordered ? theme.palette.primary.main : 'transparent'}`,
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    gap: theme.spacing(1),
    width: '100%',
    fontSize: '16px',
  }),
);

const renderToken = (item: any, name: string) => (
  <Box
    sx={(theme) => ({
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing(1),
      fontSize: theme.typography.body1,
    })}
  >
    <Avatar
      sx={(theme) => ({
        backgroundColor: theme.palette.secondary.light,
        color: theme.palette.secondary.main,
      })}
    >
      {capitalize(name.slice(0, 1))}
    </Avatar>
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}
    >
      <Amount2 unit={name} value={item} orientation={'vertical'} />
    </div>
  </Box>
);

const renderIdentifier = (string: string) => (
  <Box sx={{ width: '220px' }}>
    <Identifier value={string} href={string} />
  </Box>
);

const renderTransaction = (
  from: NetworkType,
  to: NetworkType,
  status: string,
) => (
  <Box
    sx={(theme) => ({
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: theme.typography.body1,
      width: '100%',
    })}
  >
    <Connector
      variant="filled"
      start={<Network name={from} variant="logo" />}
      end={<Network name={to} variant="logo" />}
    />
    <Chip label={status} color="success" icon={'CheckCircle'} />
  </Box>
);

const EventSkeleton = () => {
  return (
    <DataCard sx={{ height: '160px' }} variant="grid">
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
    </DataCard>
  );
};

const Event = ({ onClick, active, item, variant }: EventCardProps) => {
  const { fromChain: from, toChain: to } = item;
  return (
    <DataCard bordered={active} onClick={onClick} variant={variant}>
      {renderToken(item.amount, item.lockToken.name)}
      {renderIdentifier(item.fromAddress)}
      {renderTransaction(from, to, item.status)}
    </DataCard>
  );
};

const EventCard = ({ isLoading, ...props }: EventCardProps) => {
  return !isLoading ? <Event {...props} /> : <EventSkeleton />;
};

export default EventCard;
