import { forwardRef, HTMLAttributes } from 'react';

import { Skeleton, Stack, Typography } from '@mui/material';
import { Network as NetworkType } from '@rosen-ui/types';
import { capitalize } from 'lodash-es';

import { Avatar } from '../Avatar';
import { Card, CardBody } from '../card';
import { Connector } from '../Connector';
import { Amount, Identifier, Network } from '../display';
import { InjectOverrides } from '../InjectOverrides';
import { RelativeTime } from '../RelativeTime';
import { EventStatus, EventStatusProps } from './EventStatus';

export type EventCardProps = HTMLAttributes<HTMLDivElement> & {
  active?: boolean;
  isLoading?: boolean;
  value?: {
    amount: string;
    fromChain: NetworkType;
    href: string;
    id: string;
    status: EventStatusProps['value'];
    toChain: NetworkType;
    token: string;
    timestamp?: number;
  };
  onClick?: () => void;
};

const EventCardBase = forwardRef<HTMLDivElement, EventCardProps>(
  (props, ref) => {
    const { active, isLoading, value, onClick } = props;
    return (
      <Card
        active={active}
        backgroundColor="background.paper"
        clickable
        ref={ref}
        onClick={onClick}
      >
        <CardBody>
          <Stack gap={1}>
            <Stack gap={1} flexDirection="row">
              {isLoading && (
                <Skeleton
                  variant="circular"
                  width={48}
                  height={48}
                  style={{ minWidth: '48px' }}
                />
              )}
              {!isLoading && value && (
                <Avatar background="secondary.light" color="secondary.main">
                  {capitalize(value.token.slice(0, 1))}
                </Avatar>
              )}
              <Stack
                flexDirection="row"
                justifyContent="space-between"
                style={{ width: '100%' }}
              >
                <Amount
                  loading={isLoading}
                  orientation="vertical"
                  unit={value?.token}
                  value={value?.amount}
                />
                {!!value && 'timestamp' in value && (
                  <Stack justifyContent="flex-end">
                    <div style={{ marginBottom: '-4px' }}>
                      <RelativeTime
                        isLoading={isLoading}
                        timestamp={value?.timestamp}
                      />
                    </div>
                  </Stack>
                )}
              </Stack>
            </Stack>
            <Identifier
              href={value?.href}
              loading={isLoading}
              value={value?.id}
            />
            <Stack flexDirection="row" justifyContent="space-between">
              <Typography component="div" fontSize="12px">
                <Connector
                  variant="filled"
                  start={
                    <Network
                      loading={isLoading}
                      name={value?.fromChain}
                      variant="logo"
                    />
                  }
                  end={
                    <Network
                      loading={isLoading}
                      name={value?.toChain}
                      variant="logo"
                    />
                  }
                />
              </Typography>
              <EventStatus loading={isLoading} value={value?.status} />
            </Stack>
          </Stack>
        </CardBody>
      </Card>
    );
  },
);

EventCardBase.displayName = 'EventCard';

export const EventCard = InjectOverrides(EventCardBase);
