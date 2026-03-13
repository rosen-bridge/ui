import { ComponentProps } from 'react';

import { OverridableType } from '@/@types';
import { ElementBaseProps, Root, Wrap } from '@/core';

import './styles.scss';
import { Amount, AmountProps, Card, CardBody, EventStatus, EventStatusProps, RelativeTime, RelativeTimeProps } from '../common';
import { Token, TokenProps } from '../token';
import { Identifier, IdentifierProps } from '../identifier';
import { Connector } from '../connector';
import { Network, NetworkProps } from '../network';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface EventCardOverrides { }

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
    timestamp?: RelativeTimeProps['timestamp'];
    token?: TokenProps['value'];
    unit: AmountProps['unit'];
  };
};

export type EventCardBaseProps = ElementBaseProps<typeof Card, EventCardOwnProps>;

export type EventCardOverriddenProps = OverridableType<
  EventCardBaseProps,
  EventCardOverrides,
  never
>;

export const EventCardBase = ({ loading, value, ...rest }: EventCardOverriddenProps) => {
  return (
    <Root as={Card} backgroundColor="background.paper" {...rest}>
      <CardBody className="rosen-CardBody">
        <div className="header">
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
        <RelativeTime
          isLoading={loading}
          timestamp={value?.timestamp}
        />
        <Identifier
          href={value?.href}
          loading={loading}
          value={value?.id}
          style={{ marginTop: '-4px' }}
        />
        <div className="footer">
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
    </Root>
  );
};

EventCardBase.displayName = 'EventCard';

export const EventCard = Wrap(EventCardBase);

export type EventCardProps = ComponentProps<typeof EventCard>;
