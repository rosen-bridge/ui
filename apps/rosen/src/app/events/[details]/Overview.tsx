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

  return (
    <Section error={error} load={mutate} title="Overview">
      <Label
        label="Event Id"
        orientation="horizontal"
        rewrite={{
          tablet: {
            orientation: 'vertical',
          },
        }}
      >
        <Identifier
          style={{ width: isLoading ? '100%' : 'auto' }}
          loading={isLoading}
          value={data?.eventId}
          copyable
        />
      </Label>
      <Columns count={3} width="320px" gap="24px">
        <Label
          label="Token"
          orientation="horizontal"
          rewrite={{
            tablet: {
              orientation: 'vertical',
            },
          }}
        >
          <Token
            loading={isLoading}
            value={data?.lockToken?.id}
            variant="reverse"
            rewrite={{
              tablet: {
                variant: 'both',
              },
            }}
          />
        </Label>
        <Label
          label="Amount"
          orientation="horizontal"
          rewrite={{
            tablet: {
              orientation: 'vertical',
            },
          }}
        >
          <Amount
            loading={isLoading}
            value={data?.amount}
            decimal={data?.lockToken?.significantDecimal}
            orientation="horizontal"
            unit={data?.lockToken?.name}
            price={data?.price}
          />
        </Label>
        <Label
          label="Chain"
          orientation="horizontal"
          rewrite={{
            tablet: {
              orientation: 'vertical',
            },
          }}
        >
          <Connector
            start={
              <Network
                loading={isLoading}
                variant="logo"
                value={data?.fromChain as NetworkType}
                rewrite={{
                  tablet: {
                    variant: 'both',
                  },
                }}
              />
            }
            end={
              <Network
                loading={isLoading}
                variant="logo"
                value={data?.toChain as NetworkType}
                rewrite={{
                  tablet: {
                    variant: 'both',
                  },
                }}
              />
            }
          />
        </Label>
        <Label
          label="Status"
          orientation="horizontal"
          rewrite={{
            tablet: {
              orientation: 'vertical',
            },
          }}
        >
          <EventStatus value={data?.status} loading={isLoading} />
        </Label>
        <Label
          label="Time"
          orientation="horizontal"
          rewrite={{
            tablet: {
              orientation: 'vertical',
            },
          }}
        >
          <DateTime
            loading={isLoading}
            timestamp={(data?.timestamp || 0) * 1000}
          />
        </Label>
        <Label
          label="Fee Sum"
          orientation="horizontal"
          rewrite={{
            tablet: {
              orientation: 'vertical',
            },
          }}
        >
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
        <Label
          label="From Address"
          orientation="horizontal"
          rewrite={{
            tablet: {
              orientation: 'vertical',
            },
          }}
        >
          <Identifier
            style={{ width: isLoading ? '100%' : 'auto' }}
            loading={isLoading}
            value={data?.fromAddress}
            href={getAddressUrl(data?.fromChain, data?.fromAddress)}
            copyable
          />
        </Label>
        <Label
          label="To Address"
          orientation="horizontal"
          rewrite={{
            tablet: {
              orientation: 'vertical',
            },
          }}
        >
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
