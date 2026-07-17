'use client';

import { useEffect } from 'react';

import {
  Amount,
  Columns,
  Connector,
  Identifier,
  Label,
  Network,
  Token,
  DateTime,
  EventStatus,
  useResponsive,
  Typography,
  Menu,
  MenuItem,
  Icon,
  MenuTrigger,
  MenuBody,
} from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import { Network as NetworkType } from '@rosen-ui/types';
import { getAddressUrl } from '@rosen-ui/utils';
import useSWR from 'swr';

import { EventDetailsType } from '@/backend/events/repository';

import { Section } from './Section';

export const Overview = ({
  id,
  flowId,
  onFlowIdChange,
}: {
  id: string;
  flowId: string;
  onFlowIdChange: (flowId: string) => void;
}) => {
  const {
    error,
    data: events,
    isLoading,
    mutate,
  } = useSWR<EventDetailsType[]>(`/v1/events/${id}`, fetcher);

  useEffect(() => {
    if (events && events.length) {
      onFlowIdChange(events.at(0)?.txId || '');
    }
  }, [events]);

  const data = events?.find((event) => event.txId === flowId);

  const multipleFLow = events && events.length > 1;

  const labelOrientation = useResponsive({
    mobile: 'horizontal',
    tablet: 'vertical',
  } as const);

  const networkVariant = useResponsive({
    mobile: 'logo',
    tablet: 'both',
  } as const);

  const tokenVariant = useResponsive({
    mobile: 'reverse',
    tablet: 'both',
  } as const);

  return (
    <Section error={error} load={mutate} title="Overview">
      <Columns count={multipleFLow ? 3 : 1} width="320px" gap="24px">
        <Label label="Event Id" orientation={labelOrientation}>
          <Identifier
            style={{ width: isLoading ? '100%' : 'auto' }}
            loading={isLoading}
            value={data?.eventId}
            copyable
          />
        </Label>
        {multipleFLow && (
          <>
            <div style={{ height: '0.1px' }} />
            <div>
              <Label label="Flow Id" orientation={labelOrientation}>
                <Menu>
                  <MenuTrigger 
                    as="div" 
                    style={{
                      display: 'flex',
                      flexWrap: 'nowrap',
                      minWidth: 0,
                      alignItems: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <Identifier loading={isLoading} value={data?.txId} />
                    <Icon name="AngleDown" />
                  </MenuTrigger>
                  <MenuBody offset={[0, 4]} placement="bottom-end">
                    {events.map((event) => (
                      <MenuItem
                        key={event.txId}
                        selected={event.txId === data?.txId}
                        onClick={() => onFlowIdChange(event.txId)}
                      >
                        {event.txId}
                      </MenuItem>
                    ))}
                  </MenuBody>
                </Menu>
              </Label>
            </div>
          </>
        )}
      </Columns>
      <Columns count={3} width="320px" gap="24px">
        <Label label="Token" orientation={labelOrientation}>
          <Token
            loading={isLoading}
            value={data?.lockToken?.id}
            variant={tokenVariant}
          />
        </Label>
        <Label label="Amount" orientation={labelOrientation}>
          <Amount
            loading={isLoading}
            value={data?.amount}
            decimal={data?.lockToken?.significantDecimal}
            orientation="horizontal"
            unit={data?.lockToken?.name}
            price={data?.price}
          />
        </Label>
        <Label label="Chain" orientation={labelOrientation}>
          <Connector
            start={
              <Network
                loading={isLoading}
                value={data?.fromChain as NetworkType}
                variant={networkVariant}
              />
            }
            end={
              <Network
                loading={isLoading}
                value={data?.toChain as NetworkType}
                variant={networkVariant}
              />
            }
          />
        </Label>
        <Label label="Status" orientation={labelOrientation}>
          <EventStatus value={data?.status} loading={isLoading} />
        </Label>
        <Label label="Time" orientation={labelOrientation}>
          <DateTime
            loading={isLoading}
            timestamp={(data?.timestamp || 0) * 1000}
          />
        </Label>
        <Label label="Fee Sum" orientation={labelOrientation}>
          <Amount
            loading={isLoading}
            value={data?.totalFee}
            decimal={data?.lockToken?.significantDecimal}
            unit={data?.lockToken?.name}
            price={data?.price}
          />
        </Label>
      </Columns>
      <Columns count={3} width="320px" gap="24px">
        <Label label="From Address" orientation={labelOrientation}>
          <Identifier
            style={{ width: isLoading ? '100%' : 'auto' }}
            loading={isLoading}
            value={data?.fromAddress}
            href={getAddressUrl(data?.fromChain, data?.fromAddress)}
            copyable
          />
        </Label>
        <Label label="To Address" orientation={labelOrientation}>
          <Identifier
            style={{ width: isLoading ? '100%' : 'auto' }}
            loading={isLoading}
            value={data?.toAddress}
            href={getAddressUrl(data?.toChain, data?.toAddress)}
            copyable
          />
        </Label>
        {multipleFLow && (
          <Label label="Number of Flows" orientation={labelOrientation}>
            <Typography
              style={{ width: isLoading ? '100%' : 'auto' }}
              loading={isLoading}
            >
              {events?.length}
            </Typography>
          </Label>
        )}
      </Columns>
    </Section>
  );
};
