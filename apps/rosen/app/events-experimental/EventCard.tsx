import React from 'react';

import { ExternalLinkAlt } from '@rosen-bridge/icons';
import {
  Amount2,
  Avatar,
  Box,
  Network,
  styled,
} from '@rosen-bridge/ui-kit';
import { Network as NetworkType } from '@rosen-ui/types';

import { Connector2 } from '@/events-experimental/Connector2';

interface DataContainerProps {
  variant?: 'grid' | 'row';
  bordered?: boolean;
}

interface EventCardProps {
  onClick?: () => void;
  item?: any;
  active?: boolean;
}

const DataCard = styled('div')<DataContainerProps>(({ theme, bordered }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(1.5),
  border: `3px solid ${bordered ? theme.palette.primary.main : 'transparent'}`,
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  gap: theme.spacing(1),
  width: '100%',
  fontSize: '16px',
}));

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
      {name.slice(0, 1)}
    </Avatar>
    <Amount2 value={item} orientation={'horizontal'} />
  </Box>
);
//TODO:replace this func with Identifier and use in renderIdentifier
const shortId = (id: string) => `${id.slice(0, 26)}...${id.slice(-5)}`;

const renderIdentifier = (string: string) => (
  <Box
    sx={(theme) => ({
      display: 'flex',
      alignItems: 'center',
      fontSize: '18px',
      gap: theme.spacing(1),
      width: '100%',
    })}
  >
    {shortId(string)}
    <ExternalLinkAlt width={24} height={24} />
  </Box>
);

const renderTransaction = (from: NetworkType, to: NetworkType) => (
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
    <div style={{ width: 'fit-content' }}>Chip</div>
  </Box>
);

const EventCard = ({ onClick, active, item }: EventCardProps) => {
  const { fromChain: from, toChain: to } = item;
  return (
    <DataCard bordered={active} onClick={onClick}>
      {renderToken(item.amount, item.lockToken.name)}
      {renderIdentifier(item.fromAddress)}
      {renderTransaction(from, to)}
    </DataCard>
  );
};

export default EventCard;



