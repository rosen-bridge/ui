'use client';

import { useMemo } from 'react';

import {
  Amount,
  Box,
  Columns,
  Identifier,
  Label,
  LabelGroup,
  RelativeTime,
} from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import { getDecimalString, getTxURL } from '@rosen-ui/utils';
import useSWR from 'swr';

import { Section } from './Section';
import { EventDetailsV2 } from './type';

export const Details = ({ id }: { id: string }) => {
  const { error, data, isLoading, mutate } = useSWR<EventDetailsV2>(
    `/v1/events/${id}`,
    fetcher,
  );

  const amounts = useMemo(() => {
    return [
      ['Token Price', data?.amount, false],
      ['Fee Sum', data?.totalFee, false],
      ['Bridge Fee', data?.bridgeFee, true],
      ['Network Fee', data?.networkFee, true],
    ] as const;
  }, [data]);

  const txIds = useMemo(() => {
    return [
      ['Source Tx', data?.sourceTxId],
      ['Payment Tx', data?.paymentTxId],
      ['Reward Tx', data?.spendTxId],
      ['Trigger Tx', data?.triggerTxId],
    ] as const;
  }, [data]);

  return (
    <Section error={error} load={mutate} title="Details">
      <Columns width="300px" count={3} rule gap="24px">
        <div>
          <Label orientation="horizontal" label="Duration">
            <RelativeTime isLoading={isLoading} timestamp={data?.timestamp} />
          </Label>
          <Label label="Total Emission">
            <Amount loading={isLoading} value="TODO" unit="TODO" />
          </Label>
          <Label label="Guards" inset>
            <Amount loading={isLoading} value="TODO" unit="TODO" />
          </Label>
          <Label label="Watchers" inset>
            <Amount loading={isLoading} value="TODO" unit="TODO" />
          </Label>
          <Label label="RSN Ratio">
            <Amount loading={isLoading} value="TODO" unit="TODO" />
          </Label>
        </div>
        <div>
          {amounts.map(([label, value, inset]) => (
            <Label key={label} label={label} inset={inset}>
              <Amount
                loading={isLoading}
                value={getDecimalString(
                  value || '0',
                  data?.sourceToken?.significantDecimals || 0,
                )}
                unit={data?.sourceToken?.name}
              />
            </Label>
          ))}
        </div>
        <Box
          style={{
            columnSpan: 'all',
          }}
          overrides={{
            desktop: {
              style: {
                columnSpan: 'none',
              },
            },
          }}
        >
          <Label label="Tx IDs" />
          <LabelGroup>
            {txIds.map(([label, txId]) => (
              <Label key={label} label={label || 'N/A'} inset>
                <Identifier
                  copyable={!!txId}
                  href={getTxURL(data?.fromChain as any, txId || '') || ''}
                  loading={isLoading}
                  value={txId || 'N/A'}
                  style={{ width: '90%' }}
                />
              </Label>
            ))}
          </LabelGroup>
        </Box>
      </Columns>
    </Section>
  );
};
