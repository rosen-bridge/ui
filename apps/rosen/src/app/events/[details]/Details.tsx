'use client';

import { useMemo } from 'react';

import {
  Amount,
  Box as BoxMui,
  Columns,
  Identifier,
  InjectOverrides,
  Label,
  LabelGroup,
  RelativeTime,
} from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import { getDecimalString, getTxURL } from '@rosen-ui/utils';
import useSWR from 'swr';

import { Section } from './Section';

const Box = InjectOverrides(BoxMui);

export const Details = ({ id }: { id: string }) => {
  const { error, data, isLoading, mutate } = useSWR(
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
      ['Trigger Tx', data?.txId],
    ] as const;
  }, [data]);

  return (
    <Section error={error} load={mutate} title="Details">
      <Columns
        gap="24px"
        overrides={{
          mobile: { count: 1 },
          tablet: { count: 1 },
          laptop: { count: 2 },
          desktop: { count: 3 },
        }}
        rule
      >
        <div>
          <Label orientation="horizontal" label="Duration">
            <RelativeTime isLoading={isLoading} timestamp={data?.timestamp} />
          </Label>
          <Label label="Total Emission">
            <Amount
              style={{ height: '20px' }}
              loading={isLoading}
              value="TODO"
              unit="TODO"
            />
          </Label>
          <Label label="Guards" inset>
            <Amount
              style={{ height: '20px' }}
              loading={isLoading}
              value="TODO"
              unit="TODO"
            />
          </Label>
          <Label label="Watchers" inset>
            <Amount
              style={{ height: '20px' }}
              loading={isLoading}
              value="TODO"
              unit="TODO"
            />
          </Label>
          <Label label="RSN Ratio">
            <Amount
              style={{ height: '20px' }}
              loading={isLoading}
              value="TODO"
              unit="TODO"
            />
          </Label>
        </div>
        <div>
          {amounts.map(([label, value, inset]) => (
            <Label key={label} label={label} inset={inset}>
              <Amount
                loading={isLoading}
                value={getDecimalString(
                  value,
                  data?.lockToken?.significantDecimals,
                )}
                unit={data?.lockToken?.name}
              />
            </Label>
          ))}
        </div>
        <Box
          style={{ columnSpan: 'all' }}
          overrides={{
            desktop: { style: { columnSpan: 'unset' } },
          }}
        >
          <Label label="Tx IDs" />
          <LabelGroup>
            {txIds.map(([label, txId]) => (
              <Label key={label} label={label || 'N/A'} inset>
                <Identifier
                  copyable={!!txId}
                  href={getTxURL(data?.fromChain, txId || undefined)}
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
