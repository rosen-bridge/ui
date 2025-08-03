import React from 'react';

import {
  Amount2,
  Avatar,
  Card,
  Connector,
  Identifier,
  Network,
  Skeleton,
  Stack,
} from '@rosen-bridge/ui-kit';
import { getDecimalString } from '@rosen-ui/utils';
import { capitalize } from 'lodash-es';

import { Card2, Card2Body } from '@/app/card2';
import { EventStatus } from '@/app/events/(list)/EventStatus';
import { EventItem } from '@/types';

const EventCardSkeleton = () => {
  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: (theme) => theme.spacing(1.5),
        gap: (theme) => theme.spacing(1),
        height: '152px',
      }}
    >
      <Stack alignItems="center" flexDirection="row" gap={1}>
        <Skeleton variant="circular" width={48} height={48} />
        <Stack flexDirection="column" gap={1}>
          <Skeleton variant="rounded" width={80} height={14}></Skeleton>
          <Skeleton variant="rounded" width={60} height={14}></Skeleton>
        </Stack>
      </Stack>
      <Skeleton variant="rounded" width="100%" height={20}></Skeleton>
      <Stack
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        gap={1}
      >
        <Skeleton variant="rounded" width={80} height={32}></Skeleton>
        <Skeleton variant="rounded" width={80} height={32}></Skeleton>
      </Stack>
    </Card>
  );
};

export type EventCardProps = {
  active?: boolean;
  isLoading?: boolean;
  item?: EventItem;
  onClick?: () => void;
};

export const EventCard = ({
  active,
  isLoading,
  item,
  onClick,
}: EventCardProps) => {
  if (isLoading) return <EventCardSkeleton />;

  if (!item) return null;

  return (
    <Card2 active={active} clickable onClick={onClick}>
      <Card2Body>
        <Stack gap={1}>
          <Stack gap={1} flexDirection="row">
            <Avatar
              sx={(theme) => ({
                backgroundColor: theme.palette.secondary.light,
                color: theme.palette.secondary.main,
              })}
            >
              {capitalize(item.lockToken.name.slice(0, 1))}
            </Avatar>
            <Stack flexDirection="column" alignItems="flex-start">
              <Amount2
                unit={item.lockToken.name}
                value={getDecimalString(
                  item.amount,
                  item.lockToken.significantDecimals,
                )}
                orientation={'vertical'}
              />
            </Stack>
          </Stack>
          <Identifier value={item.eventId} href={`/events/${item.eventId}`} />
          <Stack justifyContent="space-between" flexDirection="row">
            <Connector
              variant="filled"
              start={<Network name={item.fromChain} variant="logo" />}
              end={<Network name={item.toChain} variant="logo" />}
            />
            <EventStatus value={item.status} />
          </Stack>
        </Stack>
      </Card2Body>
    </Card2>
  );
};
