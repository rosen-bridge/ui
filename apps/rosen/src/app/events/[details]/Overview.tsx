'use client';

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
} from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import { Network as NetworkType } from '@rosen-ui/types';
import { getAddressUrl } from '@rosen-ui/utils';
import useSWR from 'swr';

import { Section } from './Section';

export const Overview = ({ id }: { id: string }) => {
  const { error, data, isLoading, mutate } = useSWR(
    `/v1/events/${id}`,
    fetcher,
  );

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
      <Label label="Event Id" orientation={labelOrientation}>
        <Identifier
          style={{ width: isLoading ? '100%' : 'auto' }}
          loading={isLoading}
          value={data?.eventId}
          copyable
        />
      </Label>
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
      </Columns>
    </Section>
  );
};
