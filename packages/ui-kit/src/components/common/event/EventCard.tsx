import { forwardRef, HTMLAttributes } from 'react';

import { Skeleton, Typography } from '@mui/material';
import { Network as NetworkType } from '@rosen-ui/types';

import { Card, CardBody } from '../card';
import { Connector } from '../Connector';
import { Amount, Identifier, Network } from '../display';
import { InjectOverrides } from '../InjectOverrides';
import { RelativeTime } from '../RelativeTime';
import { Stack } from '../Stack';
import { Token } from '../Token';
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
    ergoSideTokenId?: string;
    timestamp?: number;
    flows?: number;
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
                  name={value.token}
                  ergoSideTokenId={value.ergoSideTokenId}
                  variant="logo"
                  style={{ fontSize: '20px' }}
                />
              )}
              <Amount
                loading={isLoading}
                orientation="vertical"
                unit={value?.token}
                value={value?.amount}
                decimal={value?.decimal}
              />
            </Stack>
            {!!value && ('timestamp' in value || 'flows' in value) && (
              <Stack
                direction="row"
                align="center"
                justify="between"
                style={{ marginBottom: '-4px' }}
              >
                <div>
                  {!!value && 'timestamp' in value && (
                    <RelativeTime
                      isLoading={isLoading}
                      timestamp={value?.timestamp}
                    />
                  )}
                </div>
                {!!value && 'flows' in value && (
                  <>
                    {!isLoading && (
                      <Typography color="text.secondary" variant="body2">
                        with {value.flows} flow(s)
                      </Typography>
                    )}
                    {!!isLoading && <Skeleton width="80px" variant="text" />}
                  </>
                )}
              </Stack>
            )}
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
