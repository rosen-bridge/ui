import { forwardRef, HTMLAttributes } from 'react';

import { Skeleton, Typography } from '@mui/material';
import { Network as NetworkType } from '@rosen-ui/types';

import { Connector } from '../../connector';
import { Identifier } from '../../identifier';
import { Network } from '../../network';
import { Stack } from '../../stack';
import { Card, CardBody } from '../card';
import { Amount } from '../display';
import { InjectOverrides } from '../InjectOverrides';
import { RelativeTime } from '../RelativeTime';
import { Token } from '../../token';
import { EventStatus, EventStatusProps } from './EventStatus';

export type EventCardProps = HTMLAttributes<HTMLDivElement> & {
  active?: boolean;
  isLoading?: boolean;
  value?: {
    amount: string;
    decimal: number;
    fromChain: NetworkType;
    href: string;
    id: string;
    status: EventStatusProps['value'];
    toChain: NetworkType;
    token?: string;
    unit?: string;
    timestamp?: number;
  };
  onClick?: () => void;
};

const EventCardBase = forwardRef<HTMLDivElement, EventCardProps>(
  (props, ref) => {
    const { active, isLoading, value, onClick, ...rest } = props;
    return (
      <Card
        active={active}
        backgroundColor="background.paper"
        clickable
        ref={ref}
        onClick={onClick}
        {...rest}
      >
        <CardBody>
          <Stack spacing={1}>
            <Stack spacing={1} align="center" direction="row">
              {isLoading && (
                <Skeleton
                  variant="circular"
                  width={48}
                  height={48}
                  style={{ minWidth: '48px' }}
                />
              )}
              {!isLoading && value && (
                <Token
                  value={value.token}
                  variant="logo"
                  style={{ fontSize: '20px' }}
                />
              )}
              <Amount
                loading={isLoading}
                orientation="vertical"
                unit={value?.unit}
                value={value?.amount}
                decimal={value?.decimal}
              />
            </Stack>
            <div style={{ marginBottom: '-4px' }}>
              <RelativeTime
                isLoading={isLoading}
                timestamp={value?.timestamp}
              />
            </div>
            <Identifier
              href={value?.href}
              loading={isLoading}
              value={value?.id}
            />
            <Stack direction="row" justify="between">
              <Typography component="div" fontSize="12px">
                <Connector
                  variant="filled"
                  start={
                    <Network
                      loading={isLoading}
                      value={value?.fromChain}
                      variant="logo"
                    />
                  }
                  end={
                    <Network
                      loading={isLoading}
                      value={value?.toChain}
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
