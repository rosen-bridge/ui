import { Amount, AmountProps } from '@/components';
import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

import { Card } from '../card';
import { CardBody } from '../cardBody';
import { Connector } from '../connector';
import { EventStatus, EventStatusProps } from '../eventStatus';
import { Identifier, IdentifierProps } from '../identifier';
import { Network, NetworkProps } from '../network';
import { RelativeTime, RelativeTimeProps } from '../relativeTime';
import { Token, TokenProps } from '../token';
import './styles.css';

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

export type EventCardProps = OverridableType<
  EventCardBaseProps,
  EventCardOverrides,
  never
>;

export const EventCard = (props: EventCardProps) => {
  const { loading, value, ...rest } = useConfig('EventCard', props);

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

EventCard.displayName = 'EventCard';
