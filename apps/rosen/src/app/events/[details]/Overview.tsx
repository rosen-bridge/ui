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
  LabelGroup,
} from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import { Network as NetworkType } from '@rosen-ui/types';
import { getDecimalString } from '@rosen-ui/utils';
import useSWR from 'swr';

import { Section } from './Section';
import { Status } from './Status';
import { EventDetailsV2 } from './type';

export const Overview = ({ id }: { id: string }) => {
  const { error, data, isLoading, mutate } = useSWR<EventDetailsV2>(
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
            name={data?.sourceToken?.name}
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
            value={getDecimalString(
              data?.amount || '0',
              data?.sourceToken?.significantDecimals || 0,
            )}
            orientation="horizontal"
            unit={data?.sourceToken?.symbol}
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
          <Status value={data?.status as any} loading={isLoading} />
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
            value={getDecimalString(
              data?.totalFee || '0',
              data?.sourceToken?.significantDecimals || 0,
            )}
            unit={data?.sourceToken?.name}
          />
        </Label>
      </Columns>
      <Label label="Address" />
      <LabelGroup
        overrides={{
          tablet: {
            style: { width: '70%' },
          },
        }}
      >
        <Label label="From" inset>
          <Identifier
            style={{ width: isLoading ? '75%' : 'auto' }}
            loading={isLoading}
            value={data?.fromAddress}
            href={data?.fromAddress}
            copyable
          />
        </Label>
        <Label label="To" inset>
          <Identifier
            style={{ width: isLoading ? '75%' : 'auto' }}
            loading={isLoading}
            value={data?.toAddress}
            href={data?.fromAddress}
            copyable
          />
        </Label>
      </LabelGroup>
    </Section>
  );
};
