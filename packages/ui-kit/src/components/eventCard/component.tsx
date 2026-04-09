import { ComponentProps } from 'react';

import {
  Amount,
  AmountProps,
  Card,
  CardBody,
  Connector,
  EventStatus,
  EventStatusProps,
  Identifier,
  IdentifierProps,
  Network,
  NetworkProps,
  RelativeTime,
  RelativeTimeProps,
  Token,
  TokenProps,
} from '@/components';
import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType } from '@/types';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface EventCardOverrides {}

export type EventCardOwnProps = {
  loading?: boolean;
  value?: {
    amount: AmountProps['value'];
    decimal: AmountProps['decimal'];
    fromChain: NetworkProps['value'];
    href: IdentifierProps['href'];
    id: IdentifierProps['value'];
    status: EventStatusProps['value'];
    toChain: NetworkProps['value'];
    timestamp?: RelativeTimeProps['value'];
    token?: TokenProps['value'];
    unit: AmountProps['unit'];
  };
};

export type EventCardBaseProps = ElementBaseProps<
  typeof Card,
  EventCardOwnProps
>;

export type EventCardOverriddenProps = OverridableType<
  EventCardBaseProps,
  EventCardOverrides,
  never
>;

export const EventCardBase = ({
  loading,
  value,
  ...rest
}: EventCardOverriddenProps) => {
  return (
    <Card {...rest}>
      <CardBody className="RosenEventCard-body">
        <div className="RosenEventCard-header">
          <Token
            loading={loading}
            value={value?.token}
            variant="logo"
            style={{ fontSize: '20px' }}
          />
          <Amount
            loading={loading}
            orientation="vertical"
            unit={value?.unit}
            value={value?.amount}
            decimal={value?.decimal}
          />
        </div>
        <RelativeTime loading={loading} value={value?.timestamp} />
        <Identifier
          href={value?.href}
          loading={loading}
          value={value?.id}
          style={{ marginTop: '-4px' }}
        />
        <div className="RosenEventCard-footer">
          <Connector
            variant="filled"
            start={
              <Network
                loading={loading}
                value={value?.fromChain}
                variant="logo"
              />
            }
            end={
              <Network
                loading={loading}
                value={value?.toChain}
                variant="logo"
              />
            }
          />
          <EventStatus loading={loading} value={value?.status} />
        </div>
      </CardBody>
    </Card>
  );
};

EventCardBase.displayName = 'EventCard';

export const EventCard = Wrap(EventCardBase);

export type EventCardProps = ComponentProps<typeof EventCard>;
