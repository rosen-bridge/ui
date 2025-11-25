'use client';

import { useMemo } from 'react';

import { ExclamationTriangle } from '@rosen-bridge/icons';
import {
  Amount,
  Box as BoxMui,
  Columns,
  Identifier,
  InjectOverrides,
  Label,
  LabelGroup,
  SvgIcon,
} from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';
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
      ['Source Tx', data?.fromChain, data?.sourceTxId],
      ['Payment Tx', data?.toChain, data?.paymentTxId],
      ['Reward Tx', NETWORKS.ergo.key, data?.spendTxId],
      ['Trigger Tx', NETWORKS.ergo.key, data?.txId],
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
          <Label
            orientation="horizontal"
            label="Duration"
            info="How long it takes from when the lock transaction is recorded on the blockchain until the reward transaction is confirmed. (Note: the actual payment may arrive before this full interval.)"
          >
            <SvgIcon
              style={{
                marginRight: '4px',
                fontSize: 'inherit',
              }}
            >
              <ExclamationTriangle />
            </SvgIcon>
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
          <Label
            label="RSN Ratio"
            info="The number of RSN tokens that correspond to one unit of this token."
          >
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
            {txIds.map(([label, chain, txId]) => (
              <Label key={label} label={label} inset>
                <Identifier
                  copyable={!!txId}
                  href={getTxURL(chain, txId)}
                  loading={isLoading}
                  value={txId}
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
