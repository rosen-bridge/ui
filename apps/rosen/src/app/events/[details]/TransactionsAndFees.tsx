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
} from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';
import { fetcher } from '@rosen-ui/swr-helpers';
import { getTxURL } from '@rosen-ui/utils';
import useSWR from 'swr';

import { Section } from './Section';

const Box = InjectOverrides(BoxMui);

export const TransactionsAndFees = ({ id }: { id: string }) => {
  const { error, data, isLoading, mutate } = useSWR(
    `/v1/events/${id}`,
    fetcher,
  );

  const txIds = useMemo(() => {
    return [
      ['Source Tx', data?.fromChain, data?.sourceTxId],
      ['Payment Tx', data?.toChain, data?.paymentTxId],
      ['Reward Tx', NETWORKS.ergo.key, data?.spendTxId],
      ['Trigger Tx', NETWORKS.ergo.key, data?.txId],
    ] as const;
  }, [data]);

  return (
    <Section error={error} load={mutate} title="Transactions and Fees">
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
            -
          </Label>
          <Label label="Total Emission">
            <Amount
              style={{ height: '20px' }}
              loading={isLoading}
              fallback="-"
            />
          </Label>
          <Label label="Guards" inset>
            <Amount
              style={{ height: '20px' }}
              loading={isLoading}
              fallback="-"
            />
          </Label>
          <Label label="Watchers" inset>
            <Amount
              style={{ height: '20px' }}
              loading={isLoading}
              fallback="-"
            />
          </Label>
          <Label
            label="RSN Ratio"
            info="The number of RSN tokens that correspond to one unit of this token."
          >
            <Amount
              style={{ height: '20px' }}
              loading={isLoading}
              fallback="-"
            />
          </Label>
        </div>
        <div>
          <Label label="Token Price">
            <Amount
              style={{ height: '20px' }}
              loading={isLoading}
              fallback="-"
            />
          </Label>
          <Label label="Fee Sum">
            <Amount
              loading={isLoading}
              value={data?.totalFee}
              decimal={data?.lockToken?.significantDecimals}
              unit={data?.lockToken?.name}
            />
          </Label>
          <Label label="Bridge Fee" inset>
            <Amount
              loading={isLoading}
              value={data?.bridgeFee}
              decimal={data?.lockToken?.significantDecimals}
              unit={data?.lockToken?.name}
            />
          </Label>
          <Label label="Network Fee" inset>
            <Amount
              loading={isLoading}
              value={data?.networkFee}
              decimal={data?.lockToken?.significantDecimals}
              unit={data?.lockToken?.name}
            />
          </Label>
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
                  copyable
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
