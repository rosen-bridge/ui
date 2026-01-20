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
        overrides={{
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
          overrides={{
            tablet: {
              orientation: 'vertical',
            },
          }}
        >
          <Token
            loading={isLoading}
            name={data?.lockToken?.name}
            ergoSideTokenId={data?.lockToken?.ergoSideTokenId}
            reverse
            overrides={{
              tablet: {
                reverse: false,
              },
            }}
          />
        </Label>
        <Label
          label="Amount"
          orientation="horizontal"
          overrides={{
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
          />
        </Label>
        <Label
          label="Chain"
          orientation="horizontal"
          overrides={{
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
                name={data?.fromChain as NetworkType}
                overrides={{
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
                name={data?.toChain as NetworkType}
                overrides={{
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
          overrides={{
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
          overrides={{
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
          overrides={{
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
          />
        </Label>
      </Columns>
      <Columns count={3} width="320px" gap="24px">
        <Label
          label="From Address"
          orientation="horizontal"
          overrides={{
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
          overrides={{
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
