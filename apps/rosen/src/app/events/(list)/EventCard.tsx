import React from 'react';

import {
  Amount2,
  Avatar,
  Card2,
  Card2Body,
  Connector,
  Identifier,
  Network,
  RelativeTime,
  Skeleton,
  Stack,
} from '@rosen-bridge/ui-kit';
import { getDecimalString } from '@rosen-ui/utils';
import { capitalize } from 'lodash-es';

import { EventStatus } from '@/app/events/(list)/EventStatus';
import { EventItem } from '@/types';

const EventCardSkeleton = () => {
  return (
    <Card2 backgroundColor="background.paper">
      <Card2Body style={{ height: '152px' }}>
        <Stack gap={1} justifyContent="space-between">
          <Stack alignItems="center" flexDirection="row" gap={1}>
            <Skeleton
              variant="circular"
              width={48}
              height={48}
              style={{ minWidth: '48px' }}
            />
            <Stack
              style={{ width: '100%' }}
              flexDirection="row"
              justifyContent="space-between"
            >
              <Stack flexDirection="column" gap={1}>
                <Skeleton variant="rounded" width={80} height={14}></Skeleton>
                <Skeleton variant="rounded" width={60} height={14}></Skeleton>
              </Stack>
              <Stack justifyContent="flex-end">
                <div style={{ marginBottom: '-2px' }}>
                  <Skeleton variant="rounded" width={80} height={16}></Skeleton>
                </div>
              </Stack>
            </Stack>
          </Stack>
          <Skeleton variant="rounded" width="100%" height={22}></Skeleton>
          <Stack
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            gap={1}
          >
            <Skeleton variant="rounded" width={80} height={32}></Skeleton>
            <Skeleton variant="rounded" width={80} height={32}></Skeleton>
          </Stack>
        </Stack>
      </Card2Body>
    </Card2>
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
    <Card2
      active={active}
      clickable
      onClick={onClick}
      backgroundColor="background.paper"
    >
      <Card2Body>
        <Stack gap={1}>
          <Stack gap={1} flexDirection="row">
            <Avatar background="secondary.light" color="secondary.main">
              {capitalize(item.lockToken.name.slice(0, 1))}
            </Avatar>
            <Stack
              style={{ width: '100%' }}
              flexDirection="row"
              justifyContent="space-between"
            >
              <Amount2
                unit={item.lockToken.name}
                value={getDecimalString(
                  item.amount,
                  item.lockToken.significantDecimals,
                )}
                orientation={'vertical'}
              />
              <Stack justifyContent="flex-end">
                <div style={{ marginBottom: '-4px' }}>
                  <RelativeTime timestamp={item.timestamp} />
                </div>
              </Stack>
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
