import React from 'react';

import { ExternalLinkAlt } from '@rosen-bridge/icons';
import {
  Amount2,
  Avatar,
  Box,
  Label,
  Network,
  styled,
} from '@rosen-bridge/ui-kit';
import { Network as NetworkType } from '@rosen-ui/types';
import { capitalize } from 'lodash-es';

import Chip2 from '@/events-experimental/components/Chip2';
import { Connector2 } from '@/events-experimental/components/Connector2';
import { Identifier } from '@/events-experimental/components/Identifier';

interface DataContainerProps {
  variant?: 'grid' | 'row';
  bordered?: boolean;
}

interface EventCardProps {
  onClick?: () => void;
  item?: any;
  active?: boolean;
  variant?: 'grid' | 'row';
}

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
  <Box
    sx={(theme) => ({
      width: '242px',
    })}
  >
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
    <Connector2
      variant="filled"
      start={<Network name={from} variant="logo" />}
      end={<Network name={to} variant="logo" />}
    />
    {/*TODO: create chip component*/}
    <Chip2 label={status} color="success" icon={'CheckCircle'} />
  </Box>
);

const EventCard = ({ onClick, active, item, variant }: EventCardProps) => {
  const { fromChain: from, toChain: to } = item;
  return (
    <DataCard bordered={active} onClick={onClick} variant={variant}>
      {renderToken(item.amount, item.lockToken.name)}
      {renderIdentifier(item.fromAddress)}
      {renderTransaction(from, to, item.status)}
    </DataCard>
  );
};

export default EventCard;
